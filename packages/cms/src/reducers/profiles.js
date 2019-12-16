const deepClone = require("../utils/deepClone");

const sorter = (a, b) => a.ordering - b.ordering;

const addSectionEntity = (profiles, data, accessor) => profiles.map(p => 
  Object.assign({}, p, {sections: p.sections.map(s => 
    s.id === data.section_id ? Object.assign({}, s, {[accessor]: s[accessor]
      .map(a => a.ordering >= data.ordering ? Object.assign({}, a, {ordering: a.ordering + 1}) : a)
      .concat([data])
      .sort(sorter)}) : s)}));

const updateSectionEntity = (profiles, data, accessor) => profiles.map(p => 
  Object.assign({}, p, {sections: p.sections.map(s => 
    s.id === data.section_id ? Object.assign({}, s, {[accessor]: s[accessor].map(entity => 
      entity.id === data.id ? Object.assign({}, entity, {...data}) : entity)}) : s)}));

const deleteSectionEntity = (profiles, data, accessor) => profiles.map(p => 
  Object.assign({}, p, {sections: p.sections.map(s => 
    s.id === data.parent_id ? Object.assign({}, s, {[accessor]: data.newArray}) : s)}));

const swapSectionEntity = (profiles, data, accessor) => profiles.map(p => 
  Object.assign({}, p, {sections: p.sections.map(s => 
    Object.assign({}, s, {[accessor]: s[accessor].map(entity => {
      const match = data.find(d => d.id === entity.id);
      return match ? Object.assign({}, entity, {ordering: match.ordering}) : entity;
    }).sort(sorter)})
  )}));

export default (profiles = [], action) => {
  switch (action.type) {
    // Profiles
    case "PROFILES_GET": 
      return action.data;
    case "PROFILE_NEW":
      return profiles.concat([action.data]);
    case "PROFILE_DUPLICATE": 
      return profiles.concat([action.data]);
    case "PROFILE_DELETE":
      return action.data.profiles;
    case "PROFILE_UPDATE":
      return profiles.map(p => p.id === action.data.id ? Object.assign({}, p, {...action.data}) : p);
    case "PROFILE_SWAP":
      return profiles
        .map(p => {
          const match = action.data.find(d => d.id === p.id);
          return match ? Object.assign({}, p, {ordering: match.ordering}) : p;
        }).sort((a, b) => a.ordering - b.ordering);

    // Toolbox
    case "GENERATOR_NEW":
      return profiles.map(p => p.id === action.data.profile_id ? Object.assign({}, p, {generators: p.generators.concat([action.data])}) : p);
    case "GENERATOR_UPDATE":
      return profiles.map(p => 
        p.id === action.data.profile_id 
          ? Object.assign({}, p, {generators: p.generators.map(g => g.id === action.data.id ? action.data : g)})
          : p
      );
    case "GENERATOR_DELETE":
      return profiles.map(p => p.id === action.data.parent_id ? Object.assign({}, p, {generators: action.data.generators}) : p);
    case "MATERIALIZER_NEW":
      return profiles.map(p => p.id === action.data.profile_id ? Object.assign({}, p, {materializers: p.materializers.concat([action.data])}) : p);
    case "MATERIALIZER_UPDATE":
      return profiles.map(p => 
        p.id === action.data.profile_id 
          ? Object.assign({}, p, {materializers: p.materializers.map(m => m.id === action.data.id ? action.data : m)})
          : p
      );
    case "MATERIALIZER_DELETE":
      return profiles.map(p => p.id === action.data.parent_id ? Object.assign({}, p, {materializers: action.data.materializers}) : p);
    case "MATERIALIZER_SWAP": 
      return profiles.map(p => 
        Object.assign({}, p, {materializers: p.materializers.map(m => {
          const match = action.data.find(d => d.id === m.id);
          return match ? Object.assign({}, m, {ordering: match.ordering}) : m;  
        }).sort((a, b) => a.ordering - b.ordering)}));
    case "SELECTOR_NEW":
      return profiles.map(p => p.id === action.data.profile_id ? Object.assign({}, p, {selectors: p.selectors.concat([action.data])}) : p);
    case "SELECTOR_UPDATE":
      return profiles.map(p => 
        p.id === action.data.profile_id 
          ? Object.assign({}, p, {selectors: p.selectors.map(s => s.id === action.data.id ? action.data : s)})
          : p
      );
    case "SELECTOR_DELETE":
      return profiles.map(p => p.id === action.data.parent_id ? Object.assign({}, p, {selectors: action.data.selectors}) : p);

    // Dimensions
    case "DIMENSION_MODIFY": 
      return profiles.map(p => p.id === action.data.id ? Object.assign({}, p, {...action.data}) : p);
    
    // Sections
    case "SECTION_SWAP":
      return profiles.map(p => 
        Object.assign({}, p, {sections: p.sections.map(s => {
          const match = action.data.find(d => d.id === s.id);
          return match ? Object.assign({}, s, {ordering: match.ordering}) : s;  
        }).sort((a, b) => a.ordering - b.ordering)}));
    case "SECTION_NEW":
      return profiles.map(p => p.id === action.data.profile_id ? Object.assign({}, p, {sections: p.sections
        .map(s => s.ordering >= action.data.ordering ? Object.assign({}, s, {ordering: s.ordering + 1}) : s)
        .concat([action.data])
        .sort(sorter)}) : p);
    case "SECTION_DUPLICATE":
      return profiles.map(p => p.id === action.data.profile_id ? Object.assign({}, p, {sections: p.sections
        .map(s => s.ordering >= action.data.ordering ? Object.assign({}, s, {ordering: s.ordering + 1}) : s)
        .concat([action.data])
        .sort(sorter)}) : p);
    case "SECTION_UPDATE":
      return profiles.map(p => Object.assign({}, p, {sections: p.sections.map(s => s.id === action.data.id ? Object.assign({}, s, {...action.data}) : s)}));
    case "SECTION_DELETE":
      return profiles.map(p => p.id === action.data.parent_id ? Object.assign({}, p, {sections: action.data.sections}) : p);
    
    // Subtitles
    case "SECTION_SUBTITLE_NEW":
      return addSectionEntity(profiles, action.data, "subtitles");
    case "SECTION_SUBTITLE_UPDATE":
      return updateSectionEntity(profiles, action.data, "subtitles");
    case "SECTION_SUBTITLE_DELETE":
      return deleteSectionEntity(profiles, action.data, "subtitles");
    case "SECTION_SUBTITLE_SWAP":
      return swapSectionEntity(profiles, action.data, "subtitles");

    // Stats
    case "SECTION_STAT_NEW":
      return addSectionEntity(profiles, action.data, "stats");
    case "SECTION_STAT_UPDATE":
      return updateSectionEntity(profiles, action.data, "stats");
    case "SECTION_STAT_DELETE":
      return deleteSectionEntity(profiles, action.data, "stats");
    case "SECTION_STAT_SWAP":
      return swapSectionEntity(profiles, action.data, "stats");

    // Descriptions
    case "SECTION_DESCRIPTION_NEW":
      return addSectionEntity(profiles, action.data, "descriptions");
    case "SECTION_DESCRIPTION_UPDATE":
      return updateSectionEntity(profiles, action.data, "descriptions");
    case "SECTION_DESCRIPTION_DELETE":
      return deleteSectionEntity(profiles, action.data, "descriptions");
    case "SECTION_DESCRIPTION_SWAP":
      return swapSectionEntity(profiles, action.data, "descriptions");

    // Visualizations
    case "SECTION_VISUALIZATION_NEW":
      return addSectionEntity(profiles, action.data, "visualizations");
    case "SECTION_VISUALIZATION_UPDATE":
      return updateSectionEntity(profiles, action.data, "visualizations");
    case "SECTION_VISUALIZATION_DELETE":
      return deleteSectionEntity(profiles, action.data, "visualizations");
    case "SECTION_VISUALIZATION_SWAP":
      return swapSectionEntity(profiles, action.data, "visualizations");

    // Section Selectors
    case "SECTION_SELECTOR_NEW":
      return profiles.map(p => 
        Object.assign({}, p, {sections: p.sections.map(s => 
          s.id === action.data.section_selector.section_id ? Object.assign({}, s, {selectors: s.selectors
            .map(sel => sel.ordering >= action.data.ordering ? Object.assign({}, sel, {ordering: sel.ordering + 1}) : sel)
            .concat([action.data])
            .sort(sorter)}) : s)}));
    case "SECTION_SELECTOR_DELETE":
      return profiles.map(p => 
        Object.assign({}, p, {sections: p.sections.map(s => 
          s.id === action.data.parent_id ? Object.assign({}, s, {selectors: action.data.selectors}) : s)}));
    case "SECTION_SELECTOR_SWAP":
      return profiles.map(p => 
        Object.assign({}, p, {sections: p.sections.map(s => 
          s.id === action.data.parent_id ? Object.assign({}, s, {selectors: action.data.selectors}) : s)}));

    // Variables
    case "VARIABLES_SET":
      return profiles.map(p => p.id === action.data.id ? Object.assign({}, p, {variables: deepClone(action.data.variables)}) : p);
    default: return profiles;
  }
};
