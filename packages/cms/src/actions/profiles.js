import axios from "axios";
import {assign} from "d3plus-common";
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
export function deleteProfile(id) { 
  return function(dispatch, getStore) {
    return axios.delete(`${getStore().env.CANON_API}/api/cms/profile/delete`, {params: {id}})
      .then(({data}) => {
        dispatch({type: "PROFILE_DELETE", data});
      });
  };
}

/** */
export function swapEntity(type, id) {
  return function(dispatch, getStore) {
    return axios.post(`${getStore().env.CANON_API}/api/cms/${type}/swap`, {id})
      .then(({data}) => {
        dispatch({type: `${type.toUpperCase()}_SWAP`, data});
      });
  };
}

/** */
export function modifyDimension(payload) { 
  return function(dispatch, getStore) {
    const diffCounter = getStore().cms.status.diffCounter + 1;
    return axios.post("/api/cms/profile/upsertDimension", payload)
      .then(({data}) => {
        dispatch({type: "DIMENSION_MODIFY", data, diffCounter});
      });
  };
}

/** */
export function deleteDimension(id) { 
  return function(dispatch, getStore) {
    const diffCounter = getStore().cms.status.diffCounter + 1;
    return axios.delete("/api/cms/profile_meta/delete", {params: {id}})
      .then(({data}) => {
        dispatch({type: "DIMENSION_MODIFY", data, diffCounter});
      });
  };
}

/** */
export function newEntity(type, payload) { 
  return function(dispatch, getStore) {
    return axios.post(`${getStore().env.CANON_API}/api/cms/${type}/new`, payload)
      .then(({data}) => {
        dispatch({type: `${type.toUpperCase()}_NEW`, data});
      });
  };
}

/** */
export function updateEntity(type, payload) { 
  return function(dispatch, getStore) {
    const diffCounter = getStore().cms.status.diffCounter + 1;
    return axios.post(`${getStore().env.CANON_API}/api/cms/${type}/update`, payload)
      .then(({data}) => {
        dispatch({type: `${type.toUpperCase()}_UPDATE`, data, diffCounter});
      });
  };
}

/** */
export function deleteEntity(type, payload) { 
  return function(dispatch, getStore) {
    axios.delete(`${getStore().env.CANON_API}/api/cms/${type}/delete`, {params: payload})
      .then(({data}) => {
        dispatch({type: `${type.toUpperCase()}_DELETE`, data});
      });
  };
}

/**
 * Vizes have the ability to call setVariables({key: value}), which "breaks out" of the viz
 * and overrides/sets a variable in the variables object. This does not require a server
 * round-trip - we need only inject the variables object and trigger a re-render.
 */
export function setVariables(newVariables) { 
  return function(dispatch, getStore) {
    const {currentPid} = getStore().cms.status;
    const thisProfile = getStore().cms.profiles.find(p => p.id === currentPid);
    const variables = deepClone(thisProfile.variables);
    // Users should ONLY call setVariables in a callback - never in the main execution, as this
    // would cause an infinite loop. However, should they do so anyway, try and prevent the infinite
    // loop by checking if the vars are in there already, only updating if they are not yet set.
    const alreadySet = Object.keys(variables).every(locale =>
      Object.keys(newVariables).every(key => variables[locale][key] === newVariables[key])
    );
    if (!alreadySet) {
      Object.keys(variables).forEach(locale => {
        variables[locale] = Object.assign({}, variables[locale], newVariables);
      });
      dispatch({type: "VARIABLES_SET", data: {id: currentPid, variables}});
    }
  };
}

/** */
export function resetPreviews() { 
  return function(dispatch, getStore) {
    const {currentPid, pathObj} = getStore().cms.status;
    const {profiles} = getStore().cms;
    const thisProfile = profiles.find(p => p.id === currentPid);
    const profileMeta = thisProfile.meta;
    // An empty search string will automatically provide the highest z-index results.
    // Use this to auto-populate the preview when the user changes profiles.
    const requests = profileMeta.map((meta, i) => {
      const levels = meta.levels ? meta.levels.join() : false;
      const levelString = levels ? `&levels=${levels}` : "";
      let url = `${getStore().env.CANON_API}/api/search?q=&dimension=${meta.dimension}${levelString}&limit=1`;
      
      const ps = pathObj.previews;
      // If previews is of type string, then it came from the URL permalink. Override
      // The search to manually choose the exact id for each dimension.
      if (typeof ps === "string") {
        const ids = ps.split(",");
        const id = ids[i];
        if (id) url += `&id=${id}`;
      }
      return axios.get(url);
    });
    const previews = [];
    Promise.all(requests).then(resps => {
      resps.forEach((resp, i) => {
        previews.push({
          slug: profileMeta[i].slug,
          id: resp && resp.data && resp.data.results && resp.data.results[0] ? resp.data.results[0].id : "",
          name: resp && resp.data && resp.data.results && resp.data.results[0] ? resp.data.results[0].name : "",
          memberSlug: resp && resp.data && resp.data.results && resp.data.results[0] ? resp.data.results[0].slug : ""
        });
      });
      const newPathObj = Object.assign({}, pathObj, {previews});
      console.log("changing pathObj to new previews because nodeclick");
      dispatch({type: "STATUS_SET", data: {previews, pathObj: newPathObj}});
    });
  };
}

/**
 * Certain events in the Editors, such as saving a generator, can change the resulting
 * variables object. In order to ensure that this new variables object is passed down to
 * all the editors, each editor has a callback that accesses this function. We store the
 * variables object in a hash that is keyed by the profile id.
 */
export function fetchVariables(config, useCache) { 
  return function(dispatch, getStore) {    
    const {previews, localeDefault, localeSecondary, currentPid} = getStore().cms.status;
    const diffCounter = getStore().cms.status.diffCounter + 1;

    const thisProfile = getStore().cms.profiles.find(p => p.id === currentPid);
    let variables = deepClone(thisProfile.variables);
    if (!variables) variables = {};
    if (!variables[localeDefault]) variables[localeDefault] = {_genStatus: {}, _matStatus: {}};
    if (localeSecondary && !variables[localeSecondary]) variables[localeSecondary] = {_genStatus: {}, _matStatus: {}};

    // useCache will be true if the front-end is telling us we have the variables already. Short circuit the gets/puts
    // However, still increment diffCounter so a re-render happens on cards that rely on variables.
    if (useCache && thisProfile.variables) {
      dispatch({type: "VARIABLES_SET", data: {id: currentPid, variables: deepClone(thisProfile.variables), diffCounter}});
    }
    // If we've received a zero-length config of type generator, this is a brand-new profile.
    // Return the scaffolded empty data.
    else if (config.type === "generator" && config.ids.length === 0) {
      dispatch({type: "VARIABLES_SET", data: {id: currentPid, variables}});
    }
    else {
      const locales = [localeDefault];
      if (localeSecondary) locales.push(localeSecondary);
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
          axios.post(`${getStore().env.CANON_API}/api/materializers/${currentPid}?locale=${thisLocale}${paramString}`, {variables: variables[thisLocale]}).then(mat => {
            variables[thisLocale] = assign({}, variables[thisLocale], mat.data);
            dispatch({type: "VARIABLES_SET", data: {id: currentPid, diffCounter, variables}});
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
            axios.get(`${getStore().env.CANON_API}/api/generators/${currentPid}?locale=${thisLocale}${paramString}`).then(gen => {
              variables[thisLocale] = assign({}, variables[thisLocale], gen.data);
              let gensLoaded = Object.keys(variables[thisLocale]._genStatus).filter(d => gids.includes(Number(d))).length;
              const gensTotal = gids.length;
              const genLang = thisLocale;
              // If the user is deleting a generator, then this function was called with a single gid (the one that was deleted)
              // The pruning code above already removed its vars and _genStatus from the original vars, so the loading progress
              // Can't know what to wait for. In this single instance, use this short-circuit to be instantly done and move onto mats.
              if (gids.length === 1 && JSON.stringify(gen.data) === "{}") gensLoaded = 1;
              dispatch({type: "STATUS_SET", data: {gensLoaded, gensTotal, genLang}});
              dispatch({type: "VARIABLES_SET", data: {id: currentPid, variables}});
              if (gensLoaded === gids.length) {
                // Clean out stale materializers (see above comment)
                Object.keys(variables[thisLocale]._matStatus).forEach(mid => {
                  Object.keys(variables[thisLocale]._matStatus[mid]).forEach(k => {
                    delete variables[thisLocale][k]; 
                  });
                  delete variables[thisLocale]._matStatus[mid];
                });
                axios.post(`${getStore().env.CANON_API}/api/materializers/${currentPid}?locale=${thisLocale}${paramString}`, {variables: variables[thisLocale]}).then(mat => {
                  variables[thisLocale] = assign({}, variables[thisLocale], mat.data);
                  dispatch({type: "VARIABLES_SET", data: {id: currentPid, diffCounter, variables}});
                });
              }
            });
          }
        }
      }
    }
  };
}










