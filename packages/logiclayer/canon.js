/**
    The object that this file exports is used to set configurations for canon
    and it's sub-modules.
*/

const CANON_API = "http://localhost:3300/";

module.exports = {
  logiclayer: {
    dimensionMap: {
      CIP2: "CIP",
      SCTG2: "NAPCS"
    },
    relations: {
      Geography: {
        children: id => {
          const prefix = id.slice(0, 3);
          return prefix === "010" ? "State"
            : prefix === "040" ? "County"
              : prefix === "050" ? "Tract"
                : prefix === "310" ? "County"
                  : prefix === "160" ? "Tract"
                    : false;
        }
      }
    },
    substitutions: {
      CIP: {
        levels: {
          CIP6: ["CIP4", "CIP2"],
          CIP4: ["CIP2"]
        },
        url: (id, level) => `${CANON_API}api/cip/parent/${id}/${level}/`,
        callback: resp => resp.id
      },
      NAPCS: {
        levels: {
          "NAPCS Section": ["SCTG2"],
          "NAPCS Group": ["SCTG2"],
          "NAPCS Class": ["SCTG2"]
        },
        url: id => `${CANON_API}api/napcs/${id}/sctg/`,
        callback: resp => resp.map(d => d.id)
      }
    }
  }
};
