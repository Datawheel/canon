const {Client} = require("mondrian-rest-client");
const d3Array = require("d3-array");

const {CANON_LOGICLAYER_CUBE} = process.env;

module.exports = async function() {

  const client = new Client(CANON_LOGICLAYER_CUBE);

  const cubes = await client.cubes();

  let measures = [];
  let dimensions = [];

  cubes.forEach(cube => {

    // todo: move this into the dimensions
    // measures = measures.concat(cube.measures.map(measure => measure.name.replace(/'/g, "\'")));

    dimensions = dimensions.concat(cube.dimensions
      .reduce((acc, d) => {
        
        console.log(d.cube.measures);
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
      }, {}));
  });

  return {dimensions};

};
