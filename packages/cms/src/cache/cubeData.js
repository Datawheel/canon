const {Client} = require("mondrian-rest-client");
const d3Array = require("d3-array");

const {CANON_LOGICLAYER_CUBE} = process.env;

const s = (a, b) => {
  const ta = a.name.toUpperCase();
  const tb = b.name.toUpperCase();
  return ta < tb ? -1 : ta > tb ? 1 : 0;
};

module.exports = async function() {

  const client = new Client(CANON_LOGICLAYER_CUBE);

  const cubes = await client.cubes();
  
  const dimensions = [];

  cubes.forEach(cube => {

    cube.dimensions.forEach(d => {
      const dimension = {};    
      dimension.name = `${d.name} (${cube.name})`;
      dimension.cubeName = cube.name;
      dimension.dimName = d.name;
      dimension.measures = cube.measures.map(m => m.name.replace(/'/g, "\'"));
      const hierarchies = d.hierarchies.map(h => {
        
        const levels = h.levels.filter(l => l.name !== "(All)").map(l => {
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
        return levels;
      });
      dimension.hierarchies = Array.from(new Set(d3Array.merge(hierarchies)));
      dimensions.push(dimension);
    });
  });

  return dimensions.sort(s);

};
