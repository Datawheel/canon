const Sequelize = require("sequelize"),
      axios = require("axios"),
      d3Array = require("d3-array"),
      d3Collection = require("d3-collection"),
      d3plusCommon = require("d3plus-common"),
      findYears = require("../utils/findYears"),
      multiSort = require("../utils/multiSort"),
      path = require("path"),
      {sanitize} = require("perfect-express-sanitizer"),
      yn = require("yn");

const {CANON_LOGICLAYER_CUBE} = process.env;
const logging = process.env.CANON_LOGICLAYER_LOGGING;
const slugs = yn(process.env.CANON_LOGICLAYER_SLUGS);
const verbose = yn(logging);
const errors = logging === "error";

const canonConfig = require(path.join(process.cwd(), "canon.js")).logiclayer || {};
const aliases = canonConfig.aliases || {};
const dimensionMap = canonConfig.dimensionMap || {};
const cubeFilters = canonConfig.cubeFilters || [];
const relations = canonConfig.relations || {};
const substitutions = canonConfig.substitutions || {};

const f = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));
const cartesian = (a = [], b, ...c) => b ? cartesian(f(a, b), ...c)[0] : a.map(x => [x]);

/**
    Returns the unique intersection of 2 Arrays.
*/
function intersect(a, b) {
  return [...new Set(a)].filter(x => new Set(b).has(x));
}

/**
    From a list of dimensions, tries multiples matching methods from level and optional dimension keys.
*/
function findDimension(flatDims, level, dimension) {

  let dims = typeof level === "object"
    ? flatDims.filter(d => d.level === level.level && d.dimension === level.dimension && d.hierarchy === level.hierarchy)
    : dimension
      ? flatDims.filter(d => d.level === level && d.dimension === dimension)
      : flatDims.filter(d => d.level === level || d.level.replace(`${d.dimension} `, "") === level);

  if (!dims.length && typeof level === "object") dims = flatDims.filter(d => d.level === level.level && d.dimension === level.dimension);
  else if (!dims.length) dims = flatDims.filter(d => d.level === dimension);

  if (dims.length > 1) {
    const hierarchyMatches = dims.filter(d => d.hierarchy === level);
    if (hierarchyMatches.length) dims = hierarchyMatches;
    else {
      const levelMatches = dims.filter(d => d.level === level);
      if (levelMatches.length) dims = levelMatches;
    }
  }

  return dims[0];

}

/**
    Finds a key from the req.query, uses a fallback if doesn't exist, and converts to Array if fallback is Array.
*/
function findKey(query, key, fallback) {
  let value = fallback;
  if (query[key]) value = query[key];
  else if (aliases[key]) {
    const alts = typeof aliases[key] === "string" ? [aliases[key]] : aliases[key];
    for (let i = 0; i < alts.length; i++) {
      if (query[alts[i]]) {
        value = query[alts[i]];
        break;
      }
    }
  }

  value = sanitize.prepareSanitize(value, {xss: true, noSql: true, sql: true, level: 5});

  if (fallback instanceof Array && !(value instanceof Array)) {
    value = value
      .split(/\,([^\s\d])/g)
      .reduce((arr, d) => {
        if (arr.length && arr[arr.length - 1].length === 1) arr[arr.length - 1] += d;
        else if (d.length) arr.push(d);
        return arr;
      }, []);
  }
  return value;
}

module.exports = function(app) {

  const {cache, db} = app.settings;
  const {client, measures: cubeMeasures, years} = cache.cube;

  app.get("/api/cubes", (req, res) => {
    const returnCaches = {...cache.cube};
    delete returnCaches.client;
    res.json(returnCaches);
  });

  app.get("/api/data/", async(req, res) => {

    if (!CANON_LOGICLAYER_CUBE) return res.json({error: "Logic Layer path not defined."});

    const measures = findKey(req.query, "measures", []);
    if (!measures.length) return res.json({error: "Query must contain at least one measure."});
    else {

      let reserved = ["captions", "drilldowns", "limit", "measures", "order", "parents", "properties", "sort", "Year", "debug"];
      reserved = reserved.concat(d3Array.merge(reserved.map(r => {
        let alts = aliases[r] || [];
        if (typeof alts === "string") alts = [alts];
        return alts;
      })));

      const drilldowns = findKey(req.query, "drilldowns", []);
      const properties = findKey(req.query, "properties", []);
      const order = findKey(req.query, "order", ["Year"]);
      const year = findKey(req.query, "Year", "all");
      const captions = findKey(req.query, "captions", false);

      const {
        debug = "false",
        parents = "false",
        sort = "desc"
      } = req.query;

      let {limit} = req.query,
          perValue = false;
      if (limit) {
        if (limit.includes(":")) {
          [limit, perValue] = limit.split(":");
        }
        limit = parseInt(limit, 10);
      }

      const searchDb = db ? db.search || false : false;
      const searchDims = searchDb ? await searchDb
        .findAll({
          group: ["dimension", "hierarchy"],
          attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("hierarchy")), "hierarchy"], "dimension"],
          where: {}
        })
        .catch(() => ({}))
        .reduce((obj, d) => {
          if (!obj[d.dimension]) obj[d.dimension] = [];
          obj[d.dimension].push(d.hierarchy);
          return obj;
        }, {}) : {};

      const cuts = [],
            dimensions = [],
            filters = [],
            renames = [],
            yearDims = [];

      /** */
      function analyzeRelation(key, searchDim, obj) {

        if (obj instanceof Array) return obj;
        else if (obj.cut && obj.drilldown) {
          drilldowns.push(obj.drilldown);
          if (searchDim in searchDims) {
            dimensions.push({
              alternate: key,
              dimension: searchDim,
              id: obj.cut,
              relation: obj.drilldown
            });
          }
          else {
            cuts.push([key, obj.cut]);
          }
        }
        else if (obj.drilldown) {
          drilldowns.push(obj.drilldown);
        }
        return [];

      }

      for (let key in req.query) {
        if (!reserved.includes(key)) {

          let ids = req.query[key];

          for (const alias in aliases) {
            if (Object.prototype.hasOwnProperty.call(aliases, alias)) {
              const list = aliases[alias] instanceof Array ? aliases[alias] : [aliases[alias]];
              if (list.includes(key)) key = alias;
            }
          }

          const searchDim = key in dimensionMap ? dimensionMap[key] : key;

          ids = await Promise.all(d3Array.merge(ids
            .split(/,(?=[^\s])/g)
            .map(id => {
              if (id.includes(":") && key in relations) {
                const rels = Object.keys(relations[key]);
                id = id.split(":");
                const root = id[0];
                return id.slice(1)
                  .map(v => {

                    if (rels.includes(v)) {

                      const rel = relations[key][v];

                      if (typeof rel === "function") {
                        return analyzeRelation(key, searchDim, rel(root));
                      }
                      else if (rel.url) {
                        return axios.get(rel.url(root))
                          .then(resp => resp.data)
                          .then(resp => rel.callback ? rel.callback(resp) : resp)
                          .then(obj => analyzeRelation(key, searchDim, obj))
                          .catch(() => []);
                      }
                      else {
                        return [root];
                      }

                    }
                    else return [v];

                  })
                  .filter(v => v);
              }
              else {
                return [[id]];
              }
            })));

          ids = d3Array.merge(ids);

          if (ids.length) {
            const strippedKey = key.replace(/\<|\>/g, "");
            if (searchDim in searchDims) {
              dimensions.push({
                alternate: key,
                dimension: searchDim,
                id: ids
              });
            }
            else if (strippedKey in cubeMeasures) {
              const value = parseFloat(ids[0], 10);
              if (ids.length === 1 && !isNaN(value)) {
                const operation = key.indexOf("<") === key.length - 1 ? "<="
                  : key.indexOf(">") === key.length - 1 ? ">="
                    : "=";
                filters.push([strippedKey, operation, value]);
              }
            }
            else {
              cuts.push([key, ids]);
            }
          }
        }
      }

      const searchQueries = searchDb
        ? dimensions.map(({dimension, id}) => searchDb
          .findAll({where: {dimension, id}})
          .catch(() => [])
        )
        : [];
      const attributes = await Promise.all(searchQueries);

      const queries = {};
      const dimCuts = d3Collection.nest()
        .key(d => d.hierarchy)
        .entries(d3Array.merge(attributes))
        .reduce((obj, group) => {
          const hierarchy = group.key;
          const dim = dimensions.find(dim => dim.dimension === group.values[0].dimension);
          const dimension = dim.alternate;
          if (dim.relation) {
            cuts.push([{dimension, level: hierarchy, hierarchy: dim.relation}, group.values.map(d => d.id)]);
            renames.push({[dimension]: dim.relation});
          }
          else {
            if (!obj[dimension]) obj[dimension] = {};
            if (!obj[dimension][hierarchy]) obj[dimension][hierarchy] = [];
            obj[dimension][hierarchy] = obj[dimension][hierarchy].concat(group.values);
          }
          return obj;
        }, {});

      for (let i = 0; i < measures.length; i++) {
        const measure = measures[i];

        // filter out cubes that don't match cuts and dimensions
        let cubes = (cubeMeasures[measure] ? cubeMeasures[measure].cubes : [])
          .filter(cube => {

            const flatDims = cube.flatDims = d3Array.merge(Object.values(cube.dimensions));
            cube.subs = {};
            let allowed = true;

            drilldowns.forEach(d => {
              const dim = findDimension(flatDims, d);
              if (dim && dim.caption && !renames.find(o => Object.keys(o)[0] === dim.level)) {
                renames.push({[dim.level]: dim.caption});
              }
            });

            for (const dim in dimCuts) {
              if (Object.prototype.hasOwnProperty.call(dimCuts, dim)) {
                for (const level in dimCuts[dim]) {
                  if (Object.prototype.hasOwnProperty.call(dimCuts[dim], level)) {
                    const dimension = dim in dimensionMap ? dimensionMap[dim] : dim;
                    const drilldownDim = findDimension(flatDims, level);
                    if (!drilldownDim) {

                      if (substitutions[dimension] && substitutions[dimension].levels[level]) {
                        let potentialSubs = substitutions[dimension].levels[level];
                        if (potentialSubs.includes(dim)) potentialSubs = [dim];
                        let sub;
                        for (let i = 0; i < potentialSubs.length; i++) {
                          const p = potentialSubs[i];
                          const subDim = findDimension(flatDims, p);
                          if (subDim) {
                            sub = subDim.level;
                            break;
                          }
                        }
                        if (sub) {
                          cube.subs[level] = sub;
                          break;
                        }
                        else {
                          allowed = false;
                          break;
                        }
                      }
                      else {
                        allowed = false;
                        break;
                      }
                    }
                    else if (drilldownDim.caption && !renames.find(o => Object.keys(o)[0] === drilldownDim.level)) {
                      renames.push({[drilldownDim.level]: drilldownDim.caption});
                    }
                  }
                }
                if (!allowed) break;
              }
            }

            if (allowed) {
              for (let i = 0; i < drilldowns.length; i++) {
                const drilldownDim = findDimension(flatDims, drilldowns[i]);
                if (!drilldownDim) {
                  allowed = false;
                  break;
                }
              }
            }

            if (allowed) {
              for (let i = 0; i < cuts.length; i++) {
                const cutDim = findDimension(flatDims, cuts[i][0]);
                if (!cutDim) {
                  allowed = false;
                  break;
                }
              }
            }

            return allowed;
          });

        // runs user-defined cube filters from canon.js
        cubeFilters.forEach(filter => {
          cubes = d3Collection.nest()
            .key(filter.key)
            .entries(cubes)
            .map(d => {
              if (d.values.length > 1) {
                const matching = d.values.filter(cube => cube.name.match(filter.regex));
                d.values = filter.filter(matching, {dimensions, measures}, cache);
              }
              return d.values[0];
            });
        });

        // filter out cubes with additional unused dimensions
        if (cubes.length > 1) {
          const minDims = d3Array.min(cubes.map(c => Object.keys(c.dimensions).length));
          cubes = cubes.filter(c => Object.keys(c.dimensions).length === minDims);
        }


        if (cubes.length === 0) {
          if (errors) {
            console.log("\nNo cubes matched.");
            console.log(req.query);
          }
        }
        else {
          const cube = cubes[0];
          if (!queries[cube.name]) {
            queries[cube.name] = {measures: [], ...cube};
          }
          queries[cube.name].measures.push(measure);
        }

      }

      let queryCrosses = [];
      const queryPromises = [];
      const names = Object.keys(queries);
      for (let ii = 0; ii < names.length; ii++) {
        const name = names[ii];

        const cube = queries[name];
        const flatDims = cube.flatDims;

        const cubeDimCuts = {};
        cube.substitutions = [];
        for (const dim in dimCuts) {
          if (Object.prototype.hasOwnProperty.call(dimCuts, dim)) {
            let fullDim = flatDims.find(d => d.dimension === dim || d.level === dim) || {dimension: dim};
            const realDim = fullDim.dimension;
            cubeDimCuts[realDim] = {};
            for (const level in dimCuts[dim]) {
              if (Object.prototype.hasOwnProperty.call(dimCuts[dim], level)) {
                fullDim = flatDims.find(d => (d.dimension === dim || d.level === dim) && d.level === level) || flatDims.find(d => (d.dimension === dim || d.level === dim) && d.level.includes(level)) || {dimension: dim, level};
                const masterDims = dimCuts[dim][level];
                let subLevel = cube.subs[level];

                if (subLevel) {
                  for (let d = 0; d < masterDims.length; d++) {
                    const oldId = masterDims[d].id;
                    const dimension = dim in dimensionMap ? dimensionMap[dim] : dim;
                    const rawLevel = subLevel.includes(realDim) ? subLevel.replace(`${realDim} `, "") : subLevel;
                    const subUrl = substitutions[dimension].url(oldId, rawLevel);

                    let subIds = await axios.get(subUrl)
                      .then(resp => resp.data)
                      .then(substitutions[dimension].callback ? substitutions[dimension].callback : d => d)
                      .catch(() => []);

                    if (d3plusCommon.isObject(subIds) && subIds.id && subIds.level) {
                      subLevel = subIds.level;
                      subIds = subIds.id;
                    }

                    if (!(subIds instanceof Array)) subIds = [subIds];

                    if (!(subLevel in cubeDimCuts[realDim])) cubeDimCuts[realDim][subLevel] = [];
                    if (subIds.length) {
                      subIds.forEach(subId => {
                        const subAttr = {id: subId, dimension, hierarchy: subLevel};
                        cube.substitutions.push(subAttr);
                        cubeDimCuts[realDim][subLevel].push(subAttr);
                      });
                    }
                  }
                }
                else {
                  cubeDimCuts[realDim][fullDim.level] = masterDims;
                }
              }
            }
          }
        }

        const dims = Object.keys(cube.dimensions)
          .filter(dim => dim in cubeDimCuts)
          .map(dim => {
            const cubeLevels = cube.dimensions[dim].map(d => d.level);
            const cutLevels = Object.keys(cubeDimCuts[dim]);
            const i = intersect(cubeLevels, cutLevels);
            return i.map(d => ({[dim]: d}));
          });

        const crosses = cartesian(...dims);
        if (!crosses.length) crosses.push([]);

        const queryYears = years[name] ? Array.from(new Set(d3Array.merge(year
          .split(",")
          .map(y => {
            if (y === "latest") return [years[name].latest];
            if (y === "previous") return [years[name].previous];
            if (y === "oldest") return [years[name].oldest];
            if (y === "all") return years[name].years;
            return [y];
          })
        ))) : [];

        queryCrosses = queryCrosses.concat(crosses);

        for (let iii = 0; iii < crosses.length; iii++) {
          const dimSet = crosses[iii];

          const q = client.cube(name)
            .then(c => {

              const query = c.query;

              const queryDrilldowns = drilldowns.map(d => findDimension(flatDims, d));
              const queryCuts = cuts.map(([level, value]) => [findDimension(flatDims, level), value]);

              if (verbose) console.log(`\nLogic Layer Query: ${name}`);
              if (years[name] && queryYears.length) {
                const {preferred} = findYears(flatDims);
                if (!queryDrilldowns.find(d => d.dimension === preferred.dimension)) {
                  queryDrilldowns.push(preferred);
                  yearDims.push(preferred.level);
                  if (year !== "all") queryCuts.push([preferred, queryYears]);
                  if (order.includes("Year")) order[order.indexOf("Year")] = preferred.level;
                }
              }

              dimSet.forEach(dim => {
                const dimension = Object.keys(dim)[0];
                const level = dim[dimension];
                if (dimension in cubeDimCuts) {
                  const drill = findDimension(flatDims, level, dimension);
                  queryCuts.push([drill, cubeDimCuts[dimension][level].map(d => d.id)]);
                  queryDrilldowns.push(drill);
                }
                else if (level.cut) {
                  const {level: l, cut: cutValue} = level;
                  const drill = findDimension(flatDims, l);
                  if (!dimension.includes("Year") && !drilldowns.includes(drill.level)) queryDrilldowns.push(drill);
                  queryCuts.push([drill, cutValue]);
                }
              });

              cube.measures.forEach(measure => {
                if (verbose) console.log(`Measure: ${measure}`);
                query.measure(measure);
              });

              queryCuts.forEach(arr => {
                const [drill, value] = arr;
                const {dimension, hierarchy, level} = drill;
                if (!drilldowns.includes(hierarchy)) queryDrilldowns.push(drill);
                const cut = (value instanceof Array ? value : [value]).map(v => `[${dimension}].[${hierarchy}].[${level}].&[${v}]`).join(",");
                if (verbose) console.log(`Cut: ${cut}`);
                query.cut(`{${cut}}`);
              });

              const completedDrilldowns = [];
              queryDrilldowns.forEach(d => {
                const {dimension, hierarchy, level} = d;
                const dimString = `${dimension}, ${hierarchy}, ${level}`;
                if (!completedDrilldowns.includes(dimString)) {
                  completedDrilldowns.push(dimString);
                  if (verbose) console.log(`Drilldown: ${dimString}`);
                  query.drilldown(dimension, hierarchy, level);
                  (properties.length && d.properties ? d.properties : []).forEach(prop => {
                    if (properties.includes(prop)) {
                      const propString = `${dimension}, ${level}, ${prop}`;
                      if (verbose) console.log(`Property: ${propString}`);
                      query.property(dimension, level, prop);
                    }
                  });
                }
              });

              const p = yn(parents);
              query.option("parents", p);
              if (verbose) console.log(`Parents: ${p}`);

              const d = yn(debug);
              query.option("debug", d);
              if (verbose) console.log(`Debug: ${d}`);

              filters
                .filter(f => cube.measures.includes(f[0]))
                .forEach(filter => query.filter(...filter));

              // TODO add this once mondrian-rest ordering works
              // if (limit) {
              //   query.pagination(limit);
              //   if (verbose) console.log(`Limit: ${limit}`);
              // }
              //
              // if (order.length === 1 && cube.measures.includes(order[0])) {
              //   query.sorting(order[0], sort === "desc");
              //   if (verbose) console.log(`Order: ${order[0]} (${sort})`);
              // }

              if (captions) {
                const drilldowns = query.getDrilldowns();
                (drilldowns || []).forEach(level => {
                  const ann = level.annotations[`${captions}_caption`];
                  if (ann) query.caption(level.hierarchy.dimension.name, level.name, ann);

                  // when parents requested, also get their i18n'd captions
                  if (p) {
                    d3Array.range(1, level.depth).reverse().forEach(d => {
                      const ancestor = level.hierarchy.levels.find(l => l.depth === d);
                      const ann = ancestor.annotations[`${captions}_caption`];
                      if (ann) query.caption(ancestor.hierarchy.dimension.name, ancestor.name, ann);
                    });
                  }
                });
              }

              return client.query(query, "jsonrecords");

            })
            .catch(d => {
              if (errors) {
                if (d.response) {
                  console.log("\nCube Error", d.response.status, d.response.statusText);
                  console.log(d.response.data);
                }
                else {
                  console.log("\nCube Error", d);
                }
                console.log(req.query);
              }
              return {error: d};
            });

          queryPromises.push(q);

        }

      }

      const data = await Promise.all(queryPromises);
      const levels = d3Array.merge(Object.values(searchDims));

      const slugLookup = {};
      for (const dim in dimCuts) {
        if ({}.hasOwnProperty.call(dimCuts, dim)) {
          slugLookup[dim] = {};
          for (const level in dimCuts[dim]) {
            if ({}.hasOwnProperty.call(dimCuts[dim], level)) {
              if (!slugLookup[dim][level]) slugLookup[dim][level] = {};
              dimCuts[dim][level].forEach(d => {
                if (d.slug) slugLookup[dim][level][d.id] = d.slug;
              });
            }
          }
        }
      }

      const searchLookups = [];
      for (let i = 0; i < drilldowns.length; i++) {
        const level = drilldowns[i];
        if (levels.includes(level)) {
          let dim;
          for (const d in searchDims) {
            if ({}.hasOwnProperty.call(searchDims, d) && searchDims[d].includes(level)) {
              dim = d;
              break;
            }
          }
          searchLookups.push({dimension: dim, hierarchy: level});
        }
      }

      const flatArray = await data.reduce(async(prom, d, i) => {

        let arr = await prom;

        let data = d.error || !d.data.data ? [] : d.data.data;

        // TODO remove this once mondrian-rest ordering works
        if (perValue) {
          let newData = [];
          d3Collection.nest()
            .key(d => d[perValue])
            .entries(data)
            .forEach(group => {
              const top = multiSort(group.values, order, sort).slice(0, limit);
              newData = newData.concat(top);
            });
          data = newData;
        }

        if (searchDb) {
          const lookupKeys = data.length ? intersect(levels, Object.keys(data[0])) : [];
          for (let x = 0; x < lookupKeys.length; x++) {
            const level = lookupKeys[x];
            const dim = searchLookups.find(d => d.hierarchy === level);
            if (dim) {
              if (!slugLookup[dim.dimension]) slugLookup[dim.dimension] = {};
              if (!slugLookup[dim.dimension][dim.hierarchy]) slugLookup[dim.dimension][dim.hierarchy] = {};
              const where = Object.assign({
                id: data.map(d => `${d[`ID ${level}`]}`),
                dimension: dim.dimension,
                hierarchy: dim.hierarchy
              });
              const attrs = await searchDb.findAll({where}).catch(() => []);
              attrs.forEach(d => {
                if (d.slug) slugLookup[dim.dimension][dim.hierarchy][d.id] = d.slug;
              });
            }
          }
        }

        const cross = queryCrosses[i].concat(renames);

        const newArray = data.map(row => {

          if (slugs) {
            for (const dimension in slugLookup) {
              if ({}.hasOwnProperty.call(slugLookup, dimension)) {
                const obj = slugLookup[dimension];
                for (const level in obj) {
                  if ({}.hasOwnProperty.call(obj, level)) {
                    const slug = obj[level][row[`ID ${level}`]];
                    if (row[level] && slug) row[`Slug ${level}`] = slug;
                  }
                }
              }
            }
          }

          cross.forEach(c => {
            const type = Object.keys(c)[0];
            const level = c[type];
            if (level in row && type !== level) {
              row[type] = row[level];
              delete row[level];
              row[`ID ${type}`] = row[`ID ${level}`];
              delete row[`ID ${level}`];
              if (row[`Slug ${level}`]) {
                row[`Slug ${type}`] = row[`Slug ${level}`];
                delete row[`Slug ${level}`];
              }
            }
          });
          return row;
        });

        arr = arr.concat(newArray);

        return arr;

      }, Promise.resolve([]));

      const crossKeys = d3Array.merge(queryCrosses)
        .concat(renames)
        .map(d => Object.keys(d)[0]);

      const keys = d3Array
        .merge([
          crossKeys,
          drilldowns,
          cuts.map(d => d[0]),
          yearDims
        ])
        .filter((x, i, a) => a.indexOf(x) === i);

      let mergedData = d3Collection.nest()
        .key(d => keys.map(key => d[key]).join("_"))
        .entries(flatArray)
        .map(d => Object.assign(...d.values));

      // TODO add this once mondrian-rest ordering works
      // const sourceMeasures = d3Array.merge(Object.values(queries).map(d => d.measures));
      // if (order.length > 1 || !sourceMeasures.includes(order[0])) {
      //   mergedData = multiSort(mergedData, order, sort);
      //   if (verbose) console.log(`Order: ${order.join(", ")} (${sort})`);
      // }

      // TODO remove this once mondrian-rest ordering works
      mergedData = multiSort(mergedData, order, sort);
      if (limit && !perValue) mergedData = mergedData.slice(0, limit);

      const source = Object.values(queries).map(d => {
        delete d.flatDims;
        delete d.dimensions;
        delete d.subs;
        return d;
      });

      return res.json({data: mergedData, source});

    }

  });

};
