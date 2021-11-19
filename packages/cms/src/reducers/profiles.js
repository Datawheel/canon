const {normalize, schema} = require("normalizr");

const sorter = (a, b) => a.ordering - b.ordering;

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
      console.log("redux structure", normalize(action.data, profileSchema));
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

    case "BLOCK_NEW":
      return {
        ...profiles,
        entities: {
          ...profiles.entities,
          sections: Object.values(profiles.entities.sections)
            .map(d => d.id === action.data.section_id ? {...d, blocks: d.blocks.concat([action.data.id])} : d)
            .reduce((acc, d) => ({...acc, [d.id]: d}), {}),
          blocks: Object.values(profiles.entities.blocks ? profiles.entities.blocks : {})
            .filter(d => d.section_id === action.data.section_id)
            .map(d => d.ordering > action.data.ordering ? {...d, ordering: d.ordering + 1} : d)
            .concat(action.data)
            .reduce((acc, d) => ({...acc, [d.id]: d}), profiles.entities.blocks)
        }
      };
    // todo1.0 add sorting here, like sections
    case "BLOCK_UPDATE":
      return {
        ...profiles,
        entities: {
          ...profiles.entities,
          blocks: Object.values(profiles.entities.blocks)
            .map(d => {
              if (d.id === action.data.entity.id) {
                return {...d, ...action.data.entity, _variables: action.variablesById[d.id]};
              }
              else if (action.variablesById[d.id]) {
                return {...d, _variables: action.variablesById[d.id]};
              }
              else return d;
            })
            .reduce((acc, d) => ({...acc, [d.id]: d}), profiles.entities.blocks)
        }
      };
    case "BLOCK_DELETE":
      return normalize(action.data.profiles, profileSchema);

    // Dimensions
    case "DIMENSION_MODIFY":
      return profiles.map(p => p.id === action.data.id ? Object.assign({}, p, {...action.data}) : p);

    // Sections
    case "SECTION_NEW":
      const newSortedSections = Object.values(profiles.entities.sections)
        .filter(d => d.profile_id === action.data.profile_id)
        .map(d => d.ordering >= action.data.ordering ? {...d, ordering: d.ordering + 1} : d)
        .concat(action.data)
        .sort(sorter);
      return {
        ...profiles,
        entities: {
          ...profiles.entities,
          profiles: Object.values(profiles.entities.profiles)
            .map(d => d.id === action.data.profile_id ? {...d, sections: newSortedSections.map(s => s.id)} : d)
            .reduce((acc, d) => ({...acc, [d.id]: d}), {}),
          sections: newSortedSections.reduce((acc, d) => ({...acc, [d.id]: d}), profiles.entities.sections)
        }
      };
    case "SECTION_DUPLICATE":
      return profiles.map(p => p.id === action.data.profile_id ? Object.assign({}, p, {sections: p.sections
        .map(s => s.ordering >= action.data.ordering ? Object.assign({}, s, {ordering: s.ordering + 1}) : s)
        .concat([action.data])
        .sort(sorter)}) : p);
    case "SECTION_UPDATE":
      const updateSortedSections = Object.values(profiles.entities.sections)
        .filter(d => d.profile_id === action.data.entity.profile_id)
        .map(d => d.id === action.data.id ? {...d, ...action.data.entity} : {...d, ordering: action.data.siblings[d.id]})
        .sort(sorter);
      return {
        ...profiles,
        entities: {
          ...profiles.entities,
          profiles: Object.values(profiles.entities.profiles)
            .map(d => d.id === action.data.entity.profile_id ? {...d, sections: updateSortedSections.map(s => s.id)} : d)
            .reduce((acc, d) => ({...acc, [d.id]: d}), {}),
          sections: updateSortedSections
            .reduce((acc, d) => ({...acc, [d.id]: d}), profiles.entities.sections)
        }
      };
    case "SECTION_TRANSLATE":
      return profiles.map(p => Object.assign({}, p, {sections: p.sections.map(s => s.id === action.data.id ? Object.assign({}, s, {...action.data}) : s)}));
    case "SECTION_DELETE":
      return normalize(action.data.profiles, profileSchema);
    case "SECTION_ACTIVATE":
      return {
        ...profiles,
        entities: {
          ...profiles.entities,
          blocks: Object.values(profiles.entities.blocks)
            .map(d => ({...d, _variables: action.data[d.id] || {}}))
            .reduce((acc, d) => ({...acc, [d.id]: d}), {})
        }
      };
    // Block inputs
    case "BLOCK_INPUT_NEW":
      return {
        ...profiles,
        entities: {
          ...profiles.entities,
          blocks: Object.values(profiles.entities.blocks)
            .map(d => d.id === action.data.id ? {...d, inputs: action.data.inputs.map(i => i.id)} : d)
            .map(d => action.variablesById[d.id] ? {...d, _variables: action.variablesById[d.id]} : d)
            .reduce((acc, d) => ({...acc, [d.id]: d}), {}),
          inputs: {
            ...profiles.entities.inputs,
            ...action.data.inputs.reduce((acc, d) => ({...acc, [d.id]: d}), {})
          }
        }
      };
    case "BLOCK_INPUT_DELETE":
      return {
        ...profiles,
        entities: {
          ...profiles.entities,
          blocks: Object.values(profiles.entities.blocks)
            .map(d => d.id === action.data.parent_id ? {...d, inputs: action.data.inputs.map(i => i.id)} : d)
            .map(d => action.variablesById[d.id] ? {...d, _variables: action.variablesById[d.id]} : d)
            .reduce((acc, d) => ({...acc, [d.id]: d}), {}),
          inputs: Object.values(profiles.entities.inputs)
            .filter(d => d.block_id !== action.data.parent_id)
            .concat(action.data.inputs)
            .reduce((acc, d) => ({...acc, [d.id]: d}), {})
        }
      };

    default: return profiles;
  }
};
