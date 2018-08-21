const {Client} = require("mondrian-rest-client"),
      PromiseThrottle = require("promise-throttle"),
      chalk = require("chalk"),
      d3Array = require("d3-array");

const throttle = new PromiseThrottle({
  requestsPerSecond: 50,
  promiseImplementation: Promise
});

const {CUBE_URL} = process.env;

module.exports = async function() {

  const client = new Client(CUBE_URL);

  const cubes = await client.cubes();

  const measures = {};
  cubes.forEach(cube => {

    cube.measures.forEach(measure => {

      const {name} = measure;
      if (!measures[name]) measures[name] = [];

      const dimensions = cube.dimensions
        .reduce((acc, d) => {
          let hierarchies = d.hierarchies
            .map(h => {
              const levels = h.levels.map(l => {
                const parts = l.fullName
                  .split(".")
                  .map(p => p.replace(/^\[|\]$/g, ""));
                if (parts.length === 2) parts.unshift(parts[0]);
                return {
                  dimension: parts[0],
                  hierarchy: parts[1],
                  level: parts[2],
                  properties: l.properties
                };
              });
              levels.shift();
              return levels;
            });
          hierarchies = Array.from(new Set(d3Array.merge(hierarchies)));
          acc[d.name] = hierarchies;
          return acc;
        }, {});

      measures[name].push({
        annotations: cube.annotations,
        dimensions,
        name: cube.name
      });

    });

  });

  const cubeQueries = cubes
    .filter(cube => cube.dimensions.find(d => d.name === "Year"))
    .map(cube => {

      const levels = cube.dimensions.find(d => d.name === "Year").hierarchies[0].levels;
      const query = client.members(levels[levels.length - 1])
        .then(members => {
          const years = members.map(d => d.key).sort();
          return {
            cube: cube.name,
            latest: years[years.length - 1],
            oldest: years[0],
            previous: years.length > 1 ? years[years.length - 2] : years[years.length - 1],
            years
          };
        })
        .catch(err => {
          console.error(chalk`{bold.red Error} {bold [logiclayer - year cache]} ${cube.name} {italic.green (${err.status ? `${err.status} - ` : ""}${err.message})}`);
        });

      return throttle.add(() => query);

    });

  return Promise.all(cubeQueries)
    .then(rawYears => {

      const years = rawYears.filter(d => d)
        .reduce((obj, d) => (obj[d.cube] = d, obj), {});

      return {client, measures, years};

    });

};
