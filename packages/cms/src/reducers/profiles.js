const {normalize, schema} = require("normalizr");

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

const profileSchema = [new schema.Entity("profiles", {
  sections: [new schema.Entity("sections", {
    blocks: [new schema.Entity("blocks")]
  })]
})];

export default (profiles = {}, action) => {
  switch (action.type) {
    // Profiles
    case "PROFILES_GET":
      return normalize(action.data, profileSchema);
    case "PROFILE_NEW":
      // todo1.0 return better hero section (don't use [0])
      return {
        result: profiles.result.concat([action.data.id]),
        entities: {
          ...profiles.entities,
          profiles: {...profiles.entities.profiles, [action.data.id]: {...action.data, sections: action.data.sections.map(d => d.id)}},
          sections: {...profiles.entities.sections, [action.data.sections[0].id]: action.data.sections[0]}
        }
      };
    case "PROFILE_DUPLICATE":
      return profiles.concat([action.data]);
    case "PROFILE_DELETE":
      return normalize(action.data.profiles, profileSchema);
    case "PROFILE_UPDATE":
      return profiles.map(p => p.id === action.data.id ? Object.assign({}, p, {...action.data}) : p);
    case "PROFILE_TRANSLATE":
      return profiles.map(p => p.id === action.data.id ? Object.assign({}, p, {...action.data}) : p);
    case "PROFILE_SWAP":
      return profiles
        .map(p => {
          const match = action.data.find(d => d.id === p.id);
          return match ? Object.assign({}, p, {ordering: match.ordering}) : p;
        }).sort((a, b) => a.ordering - b.ordering);

    case "BLOCK_NEW":
      return addSectionEntity(profiles, action.data, "blocks");
    case "BLOCK_UPDATE":
      return updateSectionEntity(profiles, action.data, "blocks");
    case "BLOCK_DELETE":
      return deleteSectionEntity(profiles, action.data, "blocks");
    case "BLOCK_SWAP":
      return swapSectionEntity(profiles, action.data, "blocks");

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
      return {
        ...profiles,
        entities: {
          ...profiles.entities,
          profiles: Object.values(profiles.entities.profiles)
            .map(d => d.id === action.data.profile_id ? {...d, sections: d.sections.concat([action.data.id])} : d)
            .reduce((acc, d) => ({...acc, [d.id]: d}), {}),
          sections: Object.values(profiles.entities.sections)
            .filter(d => d.profile_id === action.data.profile_id)
            .map(d => d.ordering > action.data.ordering ? {...d, ordering: d.ordering + 1} : d)
            .concat(action.data)
            .reduce((acc, d) => ({...acc, [d.id]: d}), profiles.entities.sections)
        }
      };
    case "SECTION_DUPLICATE":
      return profiles.map(p => p.id === action.data.profile_id ? Object.assign({}, p, {sections: p.sections
        .map(s => s.ordering >= action.data.ordering ? Object.assign({}, s, {ordering: s.ordering + 1}) : s)
        .concat([action.data])
        .sort(sorter)}) : p);
    case "SECTION_UPDATE":
      const sortedSections = Object.values(profiles.entities.sections)
        .filter(d => d.profile_id === action.data.entity.profile_id)
        .map(d => d.id === action.data.id ? {...d, ...action.data.entity} : {...d, ordering: action.data.siblings[d.id]})
        .sort(sorter);
      return {
        ...profiles,
        entities: {
          ...profiles.entities,
          profiles: Object.values(profiles.entities.profiles)
            .map(d => d.id === action.data.entity.profile_id ? {...d, sections: sortedSections.map(d => d.id)} : d)
            .reduce((acc, d) => ({...acc, [d.id]: d}), {}),
          sections: sortedSections
            .reduce((acc, d) => ({...acc, [d.id]: d}), profiles.entities.sections)
        }
      };
    case "SECTION_TRANSLATE":
      return profiles.map(p => Object.assign({}, p, {sections: p.sections.map(s => s.id === action.data.id ? Object.assign({}, s, {...action.data}) : s)}));
    case "SECTION_DELETE":
      return profiles.map(p => p.id === action.data.parent_id ? Object.assign({}, p, {sections: action.data.sections}) : p);

    // Block inputs
    // todo1.0, make these work
    case "BLOCK_INPUT_NEW":
      return profiles.map(p => (
        {...p, sections: p.sections.map(s =>
          s.id === action.data.section_id ? {...s, blocks: s.blocks.map(b =>
            b.id === action.data.id ? action.data : b)} : s)}));
    case "BLOCK_INPUT_DELETE":
      return profiles.map(p => (
        {...p, sections: p.sections.map(s => (
          {...s, blocks: s.blocks.map(b =>
            b.id === action.data.parent_id ? {...b, inputs: action.data.inputs} : b)}))}));
    case "BLOCK_INPUT_SWAP":
      return profiles.map(p =>
        Object.assign({}, p, {sections: p.sections.map(s =>
          s.id === action.data.parent_id ? Object.assign({}, s, {selectors: action.data.selectors}) : s)}));

    default: return profiles;
  }
};
