import axios from "axios";

/** */
export function newProfile(profile) {
  return function(dispatch, getStore) {
    return axios.post(`${getStore().env.CANON_API}/api/cms/profile/newScaffold`, profile)
      .then(({data}) => {
        dispatch({type: "PROFILE_NEW", data});
      });
  };
}
