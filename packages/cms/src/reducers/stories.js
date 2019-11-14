const addStoryEntity = (stories, data, accessor) => stories.map(p => 
  p.id === data.story_id ? Object.assign({}, p, {[accessor]: p[accessor].concat([data])}) : p);

const updateStoryEntity = (stories, data, accessor) => stories.map(p => 
  p.id === data.story_id ? Object.assign({}, p, {[accessor]: p[accessor].map(entity => 
    entity.id === data.id ? Object.assign({}, entity, {...data}) : entity)}) : p);

const deleteStoryEntity = (stories, data, accessor) => stories.map(p => 
  p.id === data.parent_id ? Object.assign({}, p, {[accessor]: data.newArray}) : p);

const swapStoryEntity = (stories, data, accessor) => stories.map(p => 
  Object.assign({}, p, {[accessor]: p[accessor].map(entity => {
    const match = data.find(d => d.id === entity.id);
    return match ? Object.assign({}, entity, {ordering: match.ordering}) : entity;
  }).sort((a, b) => a.ordering - b.ordering)}));

const addStorysectionEntity = (stories, data, accessor) => stories.map(p => 
  Object.assign({}, p, {storysections: p.storysections.map(s => 
    s.id === data.storysection_id ? Object.assign({}, s, {[accessor]: s[accessor].concat([data])}) : s)}));

const updateStorysectionEntity = (stories, data, accessor) => stories.map(p => 
  Object.assign({}, p, {storysections: p.storysections.map(s => 
    s.id === data.storysection_id ? Object.assign({}, s, {[accessor]: s[accessor].map(entity => 
      entity.id === data.id ? Object.assign({}, entity, {...data}) : entity)}) : s)}));

const deleteStorysectionEntity = (stories, data, accessor) => stories.map(p => 
  Object.assign({}, p, {storysections: p.storysections.map(s => 
    s.id === data.parent_id ? Object.assign({}, s, {[accessor]: data.newArray}) : s)}));

const swapStorysectionEntity = (stories, data, accessor) => stories.map(p => 
  Object.assign({}, p, {storysections: p.storysections.map(s => 
    Object.assign({}, s, {[accessor]: s[accessor].map(entity => {
      const match = data.find(d => d.id === entity.id);
      return match ? Object.assign({}, entity, {ordering: match.ordering}) : entity;
    }).sort((a, b) => a.ordering - b.ordering)})
  )}));

export default (stories = [], action) => {
  switch (action.type) {
    // Stories
    case "STORIES_GET": 
      return action.data;
    case "STORY_NEW":
      return stories.concat([action.data]);
    case "STORY_DELETE":
      return action.data.stories;
    case "STORY_UPDATE":
      return stories.map(p => p.id === action.data.id ? Object.assign({}, p, {...action.data}) : p);
    case "STORY_SWAP":
      return stories
        .map(p => {
          const match = action.data.find(d => d.id === p.id);
          return match ? Object.assign({}, p, {ordering: match.ordering}) : p;
        }).sort((a, b) => a.ordering - b.ordering);

    // Authors
    case "AUTHOR_NEW":
      return addStoryEntity(stories, action.data, "authors");
    case "AUTHOR_UPDATE":
      return updateStoryEntity(stories, action.data, "authors");
    case "AUTHOR_DELETE":
      return deleteStoryEntity(stories, action.data, "authors");
    case "AUTHOR_SWAP":
      return swapStoryEntity(stories, action.data, "authors");

    // Descriptions
    case "STORY_DESCRIPTION_NEW":
      return addStoryEntity(stories, action.data, "descriptions");
    case "STORY_DESCRIPTION_UPDATE":
      return updateStoryEntity(stories, action.data, "descriptions");
    case "STORY_DESCRIPTION_DELETE":
      return deleteStoryEntity(stories, action.data, "descriptions");
    case "STORY_DESCRIPTION_SWAP":
      return swapStoryEntity(stories, action.data, "descriptions");

    // Footnotes
    case "STORY_FOOTNOTE_NEW":
      return addStoryEntity(stories, action.data, "footnotes");
    case "STORY_FOOTNOTE_UPDATE":
      return updateStoryEntity(stories, action.data, "footnotes");
    case "STORY_FOOTNOTE_DELETE":
      return deleteStoryEntity(stories, action.data, "footnotes");
    case "STORY_FOOTNOTE_SWAP":
      return swapStoryEntity(stories, action.data, "footnotes");
    
    // Sections
    case "STORYSECTION_SWAP":
      return stories.map(p => 
        Object.assign({}, p, {storysections: p.storysections.map(s => {
          const match = action.data.find(d => d.id === s.id);
          return match ? Object.assign({}, s, {ordering: match.ordering}) : s;  
        }).sort((a, b) => a.ordering - b.ordering)}));
    case "STORYSECTION_NEW":
      return stories.map(p => p.id === action.data.story_id ? Object.assign({}, p, {storysections: p.storysections.concat([action.data])}) : p);
    case "STORYSECTION_UPDATE":
      return stories.map(p => Object.assign({}, p, {storysections: p.storysections.map(s => s.id === action.data.id ? Object.assign({}, s, {...action.data}) : s)}));
    case "STORYSECTION_DELETE":
      return stories.map(p => p.id === action.data.parent_id ? Object.assign({}, p, {storysections: action.data.storysections}) : p);
    
    // Subtitles
    case "STORYSECTION_SUBTITLE_NEW":
      return addStorysectionEntity(stories, action.data, "subtitles");
    case "STORYSECTION_SUBTITLE_UPDATE":
      return updateStorysectionEntity(stories, action.data, "subtitles");
    case "STORYSECTION_SUBTITLE_DELETE":
      return deleteStorysectionEntity(stories, action.data, "subtitles");
    case "STORYSECTION_SUBTITLE_SWAP":
      return swapStorysectionEntity(stories, action.data, "subtitles");

    // Stats
    case "STORYSECTION_STAT_NEW":
      return addStorysectionEntity(stories, action.data, "stats");
    case "STORYSECTION_STAT_UPDATE":
      return updateStorysectionEntity(stories, action.data, "stats");
    case "STORYSECTION_STAT_DELETE":
      return deleteStorysectionEntity(stories, action.data, "stats");
    case "STORYSECTION_STAT_SWAP":
      return swapStorysectionEntity(stories, action.data, "stats");

    // Descriptions
    case "STORYSECTION_DESCRIPTION_NEW":
      return addStorysectionEntity(stories, action.data, "descriptions");
    case "STORYSECTION_DESCRIPTION_UPDATE":
      return updateStorysectionEntity(stories, action.data, "descriptions");
    case "STORYSECTION_DESCRIPTION_DELETE":
      return deleteStorysectionEntity(stories, action.data, "descriptions");
    case "STORYSECTION_DESCRIPTION_SWAP":
      return swapStorysectionEntity(stories, action.data, "descriptions");

    // Visualizations
    case "STORYSECTION_VISUALIZATION_NEW":
      return addStorysectionEntity(stories, action.data, "visualizations");
    case "STORYSECTION_VISUALIZATION_UPDATE":
      return updateStorysectionEntity(stories, action.data, "visualizations");
    case "STORYSECTION_VISUALIZATION_DELETE":
      return deleteStorysectionEntity(stories, action.data, "visualizations");
    case "STORYSECTION_VISUALIZATION_SWAP":
      return swapStorysectionEntity(stories, action.data, "visualizations");

    default: return stories;

  }
};
