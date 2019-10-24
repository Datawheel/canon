const deepClone = require("../utils/deepClone");

export default (profiles = [], action) => {
  switch (action.type) {
    // Profiles
    case "PROFILES_GET": 
      return action.data;
    case "PROFILE_NEW":
      return profiles.concat([action.data]);
    case "PROFILE_DELETE":
      return action.data;
    case "PROFILE_SWAP":
      return profiles
        .map(p => {
          const match = action.data.find(d => d.id === p.id);
          return match ? Object.assign({}, p, {ordering: match.ordering}) : p;
        }).sort((a, b) => a.ordering - b.ordering);

    // Toolbox
    case "TOOLBOX_GET": 
      return profiles.map(p => p.id === action.data.id ? Object.assign({}, p, {...action.data.toolbox, toolboxLoaded: true}) : p);
    case "GENERATOR_NEW":
      return profiles.map(p => p.id === action.data.profile_id ? Object.assign({}, p, {generators: p.generators.concat([action.data])}) : p);
    case "GENERATOR_UPDATE":
      return profiles.map(p => 
        p.id === action.data.profile_id 
          ? Object.assign({}, p, {generators: p.generators.map(g => g.id === action.data.id ? action.data : g)})
          : p
      );
    case "GENERATOR_DELETE":
      return profiles.map(p => p.id === action.data.parent_id ? Object.assign({}, p, {deletedGeneratorID: action.data.id, generators: action.data.generators}) : p);
    case "MATERIALIZER_NEW":
      return profiles.map(p => p.id === action.data.profile_id ? Object.assign({}, p, {materializers: p.materializers.concat([action.data])}) : p);
    case "MATERIALIZER_UPDATE":
      return profiles.map(p => 
        p.id === action.data.profile_id 
          ? Object.assign({}, p, {materializers: p.materializers.map(m => m.id === action.data.id ? action.data : m)})
          : p
      );
    case "MATERIALIZER_DELETE":
      return profiles.map(p => p.id === action.data.parent_id ? Object.assign({}, p, {deletedMaterializerID: action.data.id, materializers: action.data.materializers}) : p);

    // Dimensions
    case "DIMENSION_MODIFY": 
      return action.data;
    
    // Sections
    case "SECTION_SWAP":
      return profiles
        .map(p => Object.assign({}, p, {sections: p.sections.map(s => {
          const match = action.data.find(d => d.id === s.id);
          return match ? Object.assign({}, s, {ordering: match.ordering}) : s;  
        }).sort((a, b) => a.ordering - b.ordering)}));
    case "SECTION_NEW":
      return profiles.map(p => p.id === action.data.profile_id ? Object.assign({}, p, {sections: p.sections.concat([action.data])}) : p);
    case "SECTION_DELETE":
      return profiles.map(p => action.data[0] && p.id === action.data[0].profile_id ? Object.assign({}, p, {sections: action.data}) : p);

    // Variables
    case "VARIABLES_SET":
      return profiles.map(p => p.id === action.data.id ? Object.assign({}, p, {variables: deepClone(action.data.variables)}) : p);
    default: return profiles;
  }
};
