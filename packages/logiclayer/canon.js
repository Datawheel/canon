/**
    The object that this file exports is used to set configurations for canon
    and it's sub-modules.
*/
module.exports = {
  logiclayer: {
    dimensionMap: {
      CIP2: "CIP"
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
        url: (id, level) => `http://localhost:3300/api/cip/parent/${id}/${level}/`,
        callback: resp => resp.id
      }
    }
  }
};
