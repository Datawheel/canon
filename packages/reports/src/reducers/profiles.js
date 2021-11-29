const {normalize, schema} = require("normalizr");

const profileSchema = [new schema.Entity("profiles", {
  sections: [new schema.Entity("sections", {
    blocks: [new schema.Entity("blocks", {
      inputs: [new schema.Entity("inputs")],
      consumers: [new schema.Entity("consumers")]
    })]
  })]
})];

export default (profiles = {}, action) => {
  switch (action.type) {
    // Profiles
    case "PROFILES_GET":
      console.log("wat");
      const structure = normalize(action.data, profileSchema);
      console.log("Redux Structure:", structure);
      return structure;
    case "PROFILE_NEW":
      return normalize(action.data, profileSchema);
    case "PROFILE_DELETE":
      return normalize(action.data, profileSchema);
    case "PROFILE_UPDATE":
      return normalize(action.data, profileSchema);
    case "PROFILE_TRANSLATE":
      return profiles.map(p => p.id === action.data.id ? Object.assign({}, p, {...action.data}) : p);
    case "BLOCK_NEW":
      return normalize(action.data, profileSchema);
    // todo1.0 add sorting here, like sections
    case "BLOCK_UPDATE":
      return normalize(action.data, profileSchema);
    case "BLOCK_DELETE":
      return normalize(action.data, profileSchema);
    // Dimensions
    case "DIMENSION_MODIFY":
      return profiles.map(p => p.id === action.data.id ? Object.assign({}, p, {...action.data}) : p);

    // Sections
    case "SECTION_NEW":
      return normalize(action.data, profileSchema);
    case "SECTION_UPDATE":
      return normalize(action.data, profileSchema);
    case "SECTION_TRANSLATE":
      return profiles.map(p => Object.assign({}, p, {sections: p.sections.map(s => s.id === action.data.id ? Object.assign({}, s, {...action.data}) : s)}));
    case "SECTION_DELETE":
      return normalize(action.data.profiles, profileSchema);
    case "SECTION_ACTIVATE":
      return normalize(action.data, profileSchema);

      // Block inputs
    case "BLOCK_INPUT_NEW":
      return normalize(action.data, profileSchema);
    case "BLOCK_INPUT_DELETE":
      return normalize(action.data, profileSchema);

    default: return profiles;
  }
};
