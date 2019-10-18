import axios from "axios";
import nestedObjectAssign from "../utils/nestedObjectAssign";
import deepClone from "../utils/deepClone";

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
  return function(dispatch, getStore) {
    return axios.delete(`${getStore().env.CANON_API}/api/cms/section/delete`, {params: {id}})
      .then(({data}) => {
        dispatch({type: "SECTION_DELETE", data});
      });
  };
}

/** */
export function deleteProfile(id) { 
  return function(dispatch, getStore) {
    return axios.delete(`${getStore().env.CANON_API}/api/cms/profile/delete`, {params: {id}})
      .then(({data}) => {
        dispatch({type: "PROFILE_DELETE", data});
      });
  };
}

/**
 * Certain events in the Editors, such as saving a generator, can change the resulting
 * variables object. In order to ensure that this new variables object is passed down to
 * all the editors, each editor has a callback that accesses this function. We store the
 * variables object in a hash that is keyed by the profile id.
 */
export function fetchVariables(id, config) { 
  return function(dispatch, getStore) {    
    const {previews} = getStore().cms.status;
    const currentPid = id;

    console.log("FETCHING");

    // **** FIX THIS ***
    // const {locale, localeDefault} = this.props;
    const localeDefault = "en";
    const locale = "es";

    const thisProfile = getStore().cms.profiles.find(p => p.id === id);
    let variables = deepClone(thisProfile.variables);
    if (!variables) variables = {};
    if (!variables[localeDefault]) variables[localeDefault] = {_genStatus: {}, _matStatus: {}};
    if (locale && !variables[locale]) variables[locale] = {_genStatus: {}, _matStatus: {}};
    
    const locales = [localeDefault];
    if (locale) locales.push(locale);
    for (const thisLocale of locales) {

      // If the config is for a materializer, don't run generators. Just use our current variables for the POST action
      if (config && config.type === "materializer") {
        let paramString = "";
        previews.forEach((p, i) => {
          paramString += `&slug${i + 1}=${p.slug}&id${i + 1}=${p.id}`;
        });
        const mid = config.ids[0];
        const query = {materializer: mid};
        Object.keys(query).forEach(k => {
          paramString += `&${k}=${query[k]}`;
        });
        // However, the user may have deleted a variable from their materializer. Clear out this materializer's variables 
        // BEFORE we send the variables payload - so they will be filled in again properly from the POST response.
        if (variables[thisLocale]._matStatus[mid]) {
          Object.keys(variables[thisLocale]._matStatus[mid]).forEach(k => {
            delete variables[thisLocale][k]; 
          });
          delete variables[thisLocale]._matStatus[mid];
        }
        // Once pruned, we can POST the variables to the materializer endpoint
        axios.post(`/api/materializers/${currentPid}?locale=${thisLocale}${paramString}`, {variables: variables[thisLocale]}).then(mat => {
          variables[thisLocale] = nestedObjectAssign({}, variables[thisLocale], mat.data);
          dispatch({type: "VARIABLES_SET", data: {id, variables}});
        });
      }
      else {
        const gids = config.ids || [];
        for (const gid of gids) {
          if (variables[thisLocale]._genStatus[gid]) {
            Object.keys(variables[thisLocale]._genStatus[gid]).forEach(k => {
              delete variables[thisLocale][k];
            });
          }
          delete variables[thisLocale]._genStatus[gid];
        }
        for (const gid of gids) {
          const query = {generator: gid};
          let paramString = "";
          previews.forEach((p, i) => {
            paramString += `&slug${i + 1}=${p.slug}&id${i + 1}=${p.id}`;
          });
          Object.keys(query).forEach(k => {
            paramString += `&${k}=${query[k]}`;
          });
          axios.get(`/api/generators/${currentPid}?locale=${thisLocale}${paramString}`).then(gen => {
            variables[thisLocale] = nestedObjectAssign({}, variables[thisLocale], gen.data);
            let gensLoaded = Object.keys(variables[thisLocale]._genStatus).filter(d => gids.includes(Number(d))).length;
            const gensTotal = gids.length;
            const genLang = thisLocale;
            // If the user is deleting a generator, then this function was called with a single gid (the one that was deleted)
            // The pruning code above already removed its vars and _genStatus from the original vars, so the loading progress
            // Can't know what to wait for. In this single instance, use this short-circuit to be instantly done and move onto mats.
            if (gids.length === 1 && JSON.stringify(gen.data) === "{}") gensLoaded = 1;
            dispatch({type: "STATUS_SET", data: {gensLoaded, gensTotal, genLang}});
            dispatch({type: "VARIABLES_SET", data: {id, variables}});
            if (gensLoaded === gids.length) {
              // Clean out stale materializers (see above comment)
              Object.keys(variables[thisLocale]._matStatus).forEach(mid => {
                Object.keys(variables[thisLocale]._matStatus[mid]).forEach(k => {
                  delete variables[thisLocale][k]; 
                });
                delete variables[thisLocale]._matStatus[mid];
              });
              axios.post(`/api/materializers/${currentPid}?locale=${thisLocale}${paramString}`, {variables: variables[thisLocale]}).then(mat => {
                variables[thisLocale] = nestedObjectAssign({}, variables[thisLocale], mat.data);
                dispatch({type: "VARIABLES_SET", data: {id, variables}});
              });
            }
          });
        }
      }
    }
  };
}










