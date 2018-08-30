/**
    The object that this file exports is used to set configurations for canon
    and it's sub-modules.
*/
module.exports = {
  logiclayer: {
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
