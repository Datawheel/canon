import axios from "axios";

/** */
export function getStories() {
  return function(dispatch, getStore) {
    return axios.get(`${getStore().env.CANON_API}/api/cms/storytree`)
      .then(({data}) => {
        dispatch({type: "STORIES_GET", data});
      });
  };
}

/** */
export function newStory() {
  return function(dispatch, getStore) {
    return axios.post(`${getStore().env.CANON_API}/api/cms/story/newScaffold`)
      .then(({data}) => {
        dispatch({type: "STORY_NEW", data});
      });
  };
}

/** */
export function deleteStory(id) { 
  return function(dispatch, getStore) {
    return axios.delete(`${getStore().env.CANON_API}/api/cms/story/delete`, {params: {id}})
      .then(({data}) => {
        dispatch({type: "STORY_DELETE", data});
      });
  };
}
