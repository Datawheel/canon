/**
    The object that this file exports is used to set configurations for canon
    and it's sub-modules.
*/

const CANON_API = "http://localhost:3300";
const {CANON_LOGICLAYER_CUBE} = process.env;

module.exports = {
  logiclayer: {
    dimensionMap: {
      "CIP2": "CIP",
      "SCTG2": "NAPCS",
      "Destination State": "Geography",
      "Origin State": "Geography"
    },
    relations: {
      Geography: {
        children: {
          url: id => `${CANON_API}/api/geo/children/${id}/`
        },
        childrenCounty: {
          url: id => `${CANON_API}/api/geo/childrenCounty/${id}/`
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
      }
    },
    substitutions: {
      Geography: {
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
      CIP: {
        levels: {
          CIP6: ["CIP4", "CIP2"],
          CIP4: ["CIP2"]
        },
        url: (id, level) => `${CANON_API}/api/cip/parent/${id}/${level}/`,
        callback: resp => resp.id
      },
      NAPCS: {
        levels: {
          "NAPCS Section": ["SCTG2"],
          "NAPCS Group": ["SCTG2"],
          "NAPCS Class": ["SCTG2"]
        },
        url: id => `${CANON_API}/api/napcs/${id}/sctg/`,
        callback: resp => resp.map(d => d.id)
      }
    }
  }
};
