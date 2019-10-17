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
export function newProfile(profile) {
  return function(dispatch, getStore) {
    return axios.post(`${getStore().env.CANON_API}/api/cms/profile/newScaffold`, profile)
      .then(({data}) => {
        dispatch({type: "PROFILE_NEW", data});
      });
  };
}
