const d3Array = require("d3-array");
const {CANON_API, CANON_LOGICLAYER_CUBE} = process.env;

module.exports = {
  logiclayer: {
    aliases: {
      "CIP": "cip",
      "Geography": "geo",
      "measures": ["measure", "required"],
      "PUMS Industry": "naics",
      "PUMS Occupation": "soc",
      "University": "university",
      "Year": "year",
      "NAPCS": "napcs"
    },
    cubeFilters: [
      {
        filter: (cubes, query, caches) => {
          const {pops} = caches;
          const ids = d3Array.merge(query.dimensions
            .filter(d => d.dimension === "Geography")
            .map(d => d.id));
          const bigGeos = pops ? ids.every(g => pops[g] && pops[g] >= 250000) : true;
          return cubes.filter(cube => cube.name.match(bigGeos ? /_1$/g : /_5$/g));
        },
        key: cube => cube.name.replace("_c_", "_").replace(/_[0-9]$/g, "")
      },
      {
        filter: cubes => cubes.filter(c => c.name.includes("_c_")),
        key: cube => cube.name.replace("_c_", "_")
      },
      {
        filter: cubes => cubes.filter(c => c.name === "ipeds_graduation_demographics_v3"),
        key: cube => cube.name === "ipeds_undergrad_grad_rate_demographics" || cube.name === "ipeds_graduation_demographics_v2" ? "ipeds_graduation_demographics_v3" : cube.name
      }
    ],
    dimensionMap: {
      "CIP2": "CIP",
      "Commodity L0": "PUMS Industry",
      "Commodity L1": "PUMS Industry",
      "Industry L0": "PUMS Industry",
      "Industry L1": "PUMS Industry",
      "OPEID": "University",
      "SCTG2": "NAPCS",
      "Destination State": "Geography",
      "Origin State": "Geography"
    },
    relations: {
      Geography: {
        children: {
          url: id => `${CANON_API}/api/geo/children/${id}/`
        },
        tracts: {
          url: id => `${CANON_API}/api/geo/children/${id}/?level=Tract`
        },
        places: {
          url: id => `${CANON_API}/api/geo/children/${id}/&level=Place`
        },
        childrenCounty: {
          url: id => `${CANON_API}/api/geo/childrenCounty/${id}/`
        },
        neighbors: {
          url: id => `${CANON_LOGICLAYER_CUBE}/geoservice-api/neighbors/${id}`,
          callback: arr => arr.map(d => d.geoid)
        },
        parents: {
          url: id => {
            const prefix = id.slice(0, 3);
            const targetLevels = prefix === "040" ? "nation" /* state */
              : prefix === "050" ? "nation,state" /* county */
                : prefix === "310" ? "nation,state" /* msa */
                  : prefix === "160" ? "nation,state" /* place */
                    : prefix === "795" ? "nation,state" /* puma */
                      : false;
            return targetLevels
              ? `${CANON_LOGICLAYER_CUBE}/geoservice-api/relations/intersects/${id}?targetLevels=${targetLevels}`
              : `${CANON_LOGICLAYER_CUBE}/geoservice-api/relations/intersects/${id}`;
          },
          callback: arr => {
            const ids = arr.map(d => d.geoid);
            if (!ids.includes("01000US")) ids.push("01000US");
            return ids;
          }
        }
      },
      University: {
        similar: {
          url: id => `${CANON_API}/api/university/similar/${id}`,
          callback: arr => arr.map(d => d.id)
        }
      }
    },
    substitutions: {
      "Geography": {
        levels: {
          State: ["Nation"],
          County: ["State", "Nation"],
          Msa: ["State", "Nation"],
          Place: ["State", "Nation"],
          Puma: ["State", "Nation"]
        },
        url: (id, level) => {
          const targetLevel = level.replace(/^[A-Z]{1}/g, chr => chr.toLowerCase());
          return `${CANON_LOGICLAYER_CUBE}/geoservice-api/relations/intersects/${id}?targetLevels=${targetLevel}&overlapSize=true`;
        },
        callback: arr => arr.sort((a, b) => b.overlap_size - a.overlap_size)[0].geoid
      },
      "CIP": {
        levels: {
          CIP6: ["CIP4", "CIP2"],
          CIP4: ["CIP2"]
        },
        url: (id, level) => `${CANON_API}/api/cip/parent/${id}/${level}/`,
        callback: resp => resp.id
      },
      "NAPCS": {
        levels: {
          "NAPCS Section": ["SCTG2"],
          "NAPCS Group": ["SCTG2"],
          "NAPCS Class": ["SCTG2"]
        },
        url: id => `${CANON_API}/api/napcs/${id}/sctg/`,
        callback: resp => resp.map(d => d.id)
      },
      "PUMS Industry": {
        levels: {
          "Industry Group": ["Industry L1", "Commodity L1"],
          "Industry Sub-Sector": ["Industry L1", "Commodity L1"],
          "Industry Sector": ["Industry L1", "Commodity L1"]
        },
        url: (id, level) => `${CANON_API}/api/naics/${id}/io/${level}`,
        callback: resp => resp
      },
      "University": {
        levels: {
          University: ["OPEID"]
        },
        url: id => `${CANON_API}/api/university/opeid/${id}/`,
        callback: resp => resp.opeid
      }
    }
  }
};
