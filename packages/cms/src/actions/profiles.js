import axios from "axios";

/** */
export function getProfiles() {
  return function(dispatch, getStore) {
    return axios.get(`${getStore().env.CANON_API}/api/cms/tree`)
      .then(({data}) => {
        dispatch({type: "PROFILES_GET", data});
      });
  };
}

/** */
export function newProfile() {
  return function(dispatch, getStore) {
    return axios.post(`${getStore().env.CANON_API}/api/cms/profile/newScaffold`)
      .then(({data}) => {
        dispatch({type: "PROFILE_NEW", data});
      });
  };
}

/** */
export function swapEntity(type, id, dir) {
  return function(dispatch, getStore) {
    return axios.post(`${getStore().env.CANON_API}/api/cms/${type}/swap`, {id, dir})
      .then(({data}) => {
        dispatch({type: `${type.toUpperCase()}_SWAP`, data});
      });
  };
}

/** */
export function newSection(profile_id) { 
  return function(dispatch, getStore) {
    return axios.post(`${getStore().env.CANON_API}/api/cms/section/new`, {profile_id})
      .then(({data}) => {
        dispatch({type: "SECTION_NEW", data});
      });
  };
}

/** */
export function deleteSection(id) { 
  console.log("calling delete");
  return function(dispatch, getStore) {
    return axios.delete(`${getStore().env.CANON_API}/api/cms/section/delete`, {params: {id}})
      .then(({data}) => {
        dispatch({type: "SECTION_DELETE", data});
      });
  };
}
