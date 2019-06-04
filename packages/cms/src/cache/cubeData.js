const d3Array = require("d3-array");
const axios = require("axios");

let url = process.env.CANON_CMS_CUBES;

// Older version of CANON_CMS_CUBES had a full path to the cube (path.com/cubes)
// CANON_CMS_CUBES was changed to be root only, so fix it here so we can handle
// both the new style and the old style
url = url.replace("/cubes/", "");
url = url.replace("/cubes", "");
if (url.substr(-1) === "/") url = url.slice(0, -1);
url = `${url}/cubes`;

const s = (a, b) => {
  const ta = a.name.toUpperCase();
  const tb = b.name.toUpperCase();
  return ta < tb ? -1 : ta > tb ? 1 : 0;
};

module.exports = async function() {

  
  const client = axios.get(url);
  const resp = await client;
  const cubes = resp.data.cubes;

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
            ? l.fullName
              .split(".")
              .map(p => p.replace(/^\[|\]$/g, ""))
            : [d.name, h.name, l.name];

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
