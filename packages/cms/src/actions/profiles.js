import axios from "axios";
import {assign} from "d3plus-common";
import deepClone from "../utils/deepClone";
import getLocales from "../utils/getLocales";
import attify from "../utils/attify";
import groupMeta from "../utils/groupMeta";

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
export function duplicateProfile(id) { 
  return function(dispatch, getStore) {
    return axios.post(`${getStore().env.CANON_API}/api/cms/profile/duplicate`, {id})
      .then(({data}) => {
        dispatch({type: "PROFILE_DUPLICATE", data});
      });
  };
}

/** */
export function duplicateSection(id, pid) { 
  return function(dispatch, getStore) {
    return axios.post(`${getStore().env.CANON_API}/api/cms/section/duplicate`, {id, pid})
      .then(({data}) => {
        dispatch({type: "SECTION_DUPLICATE", data});
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
    dispatch({type: "SEARCH_LOADING"});
    const diffCounter = getStore().cms.status.diffCounter + 1;
    return axios.post("/api/cms/profile/upsertDimension", payload)
      .then(({data}) => {
        dispatch({type: "DIMENSION_MODIFY", data, diffCounter});
        // TODO: Remove reset previews - have all profiles come from the server 
        // with their default values already set.
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
    // Updates might need to trigger re-running certain displays. Use diffCounter to track changes
    const diffCounter = getStore().cms.status.diffCounter + 1;
    // Formatters require locales in the payload to know what languages to compile for
    const locales = getLocales(getStore().env);
    return axios.post(`${getStore().env.CANON_API}/api/cms/${type}/update`, payload)
      .then(({data}) => {
        dispatch({type: `${type.toUpperCase()}_UPDATE`, data, diffCounter, locales});
      });
  };
}

/** */
export function deleteEntity(type, payload) { 
  return function(dispatch, getStore) {
    // Deletes might need to trigger re-running certain displays. Use diffCounter to track changes
    const diffCounter = getStore().cms.status.diffCounter + 1;
    // Formatters require locales in the payload to know what languages to compile for
    const locales = getLocales(getStore().env);
    axios.delete(`${getStore().env.CANON_API}/api/cms/${type}/delete`, {params: payload})
      .then(({data}) => {
        dispatch({type: `${type.toUpperCase()}_DELETE`, data, diffCounter, locales});
      });
  };
}

/** */
export function fetchSectionPreview(id, locale) { 
  return function(dispatch, getStore) {
    dispatch({type: "SECTION_PREVIEW_FETCH"});
    const {currentPid, pathObj} = getStore().cms.status;
    const thisProfile = getStore().cms.profiles.find(p => p.id === currentPid);
    const variables = thisProfile.variables[locale];
    const {previews} = pathObj;
    const idString = previews.reduce((acc, id, i) => `${acc}&slug${i + 1}=${id.slug}&id${i + 1}=${id.id}`, "");
    const url = `${getStore().env.CANON_API}/api/profile?profile=${currentPid}&section=${id}&locale=${locale}${idString}`;
    axios.post(url, {variables})
      .then(({data}) => {
        dispatch({type: "SECTION_PREVIEW_SET", data});
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

    // Meta may have multiple variants under the same ordering index. Group them into their shared ordering indeces.
    const groupedMeta = groupMeta(profileMeta);
  
    const requests = groupedMeta.map((group, i) => {
      let url;
      // If previews is of type string, then it came from the URL permalink. Override
      // The search to manually choose the exact slug
      if (typeof pathObj.previews === "string") {
        const slugs = pathObj.previews.split(",");
        const thisMemberSlug = slugs[i];
        url = `${getStore().env.CANON_API}/api/search?slug=${thisMemberSlug}&limit=1&parents=true`;
      }
      // Otherwise, use an empty string query to provide the highest z-index result so it will "auto-select"
      // When the user changes profiles
      else {
        // There are several variants possible - when auto-selecting default to the first one.
        const meta = group[0];
        const levels = meta.levels ? meta.levels.join() : false;
        const levelString = levels ? `&levels=${levels}` : "";  
        url = `${getStore().env.CANON_API}/api/search?q=&dimension=${meta.dimension}${levelString}&cubeName=${meta.cubeName}&limit=1&parents=true`;
      }
      return axios.get(url);
    });
    const previews = [];
    Promise.all(requests).then(resps => {
      resps.forEach((resp, i) => {
        // If our result doesn't return for some reason, scaffold out a mostly-blank result with the first group's first meta
        const newPreview = {slug: groupedMeta[i][0].slug, id: "", name: "", memberSlug: "", searchObj: {}};
        if (resp && resp.data && resp.data.results && resp.data.results[0]) {
          const result = resp.data.results[0];
          // Because any given dimension has many variants, we must use the returned member to find out which one we're on.
          const thisGroup = groupedMeta[i];
          const matchingMeta = thisGroup.find(meta => meta.dimension === result.dimension && meta.cubeName === result.cubeName);
          if (matchingMeta) {
            newPreview.slug = matchingMeta.slug;
            newPreview.id = result.id;
            newPreview.name = result.name;
            newPreview.memberSlug = result.slug;
            newPreview.searchObj = result;
          }
        }
        previews.push(newPreview);
      });
      const newPathObj = Object.assign({}, pathObj, {previews});
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
    dispatch({type: "VARIABLES_FETCH"});
    const {previews, localeDefault, localeSecondary, currentPid} = getStore().cms.status;
    const {auth} = getStore();

    const thisProfile = getStore().cms.profiles.find(p => p.id === currentPid);
    let variables = deepClone(thisProfile.variables);
    if (!variables) variables = {};
    if (!variables[localeDefault]) variables[localeDefault] = {_genStatus: {}, _matStatus: {}};
    if (localeSecondary && !variables[localeSecondary]) variables[localeSecondary] = {_genStatus: {}, _matStatus: {}};

    // useCache will be true if the front-end is telling us we have the variables already. Short circuit the gets/puts
    // However, still increment diffCounter so a re-render happens on cards that rely on variables.
    if (useCache && thisProfile.variables) {
      const diffCounter = getStore().cms.status.diffCounter + 1;
      dispatch({type: "VARIABLES_SET", data: {id: currentPid, variables: deepClone(thisProfile.variables), diffCounter}});
      dispatch({type: "VARIABLES_FETCHED"});
    }
    else {
      const locales = [localeDefault];
      if (localeSecondary) locales.push(localeSecondary);
      for (const thisLocale of locales) {
        const attributes = attify(previews.map(d => d.searchObj), thisLocale);
        if (auth.user) {
          const {password, salt, ...user} = auth.user; // eslint-disable-line
          attributes.user = user;
          // Bubble up userRole for easy access in front end (for hiding sections based on role)
          attributes.userRole = user.role;
        }
        // If the config is for a materializer, or its for zero-length generators (like in a new profile) 
        // don't run custom generators. Just use our current variables for the POST action for materializers
        if (config.type === "materializer" || config.type === "generator" && config.ids.length === 0) {
          let paramString = "";
          previews.forEach((p, i) => {
            paramString += `&slug${i + 1}=${p.slug}&id${i + 1}=${p.id}`;
          });
          let query = {};
          if (config.type === "materializer") {
            const mid = config.ids[0];
            query = {materializer: mid};
          }
          Object.keys(query).forEach(k => {
            paramString += `&${k}=${query[k]}`;
          });
          if (config.type === "materializer") {
            // The user may have deleted a variable from their materializer. Clear out this materializer's variables 
            // BEFORE we send the variables payload - so they will be filled in again properly from the POST response.
            const mid = config.ids[0];
            if (variables[thisLocale]._matStatus[mid]) {
              Object.keys(variables[thisLocale]._matStatus[mid]).forEach(k => {
                delete variables[thisLocale][k]; 
              });
              delete variables[thisLocale]._matStatus[mid];
            }
            // Once pruned, we can POST the variables to the materializer endpoint
            axios.post(`${getStore().env.CANON_API}/api/materializers/${currentPid}?locale=${thisLocale}${paramString}`, {variables: variables[thisLocale]}).then(mat => {
              variables[thisLocale] = assign({}, variables[thisLocale], mat.data);
              const diffCounter = getStore().cms.status.diffCounter + 1;
              dispatch({type: "VARIABLES_SET", data: {id: currentPid, diffCounter, variables}});
              dispatch({type: "VARIABLES_FETCHED"});
            });
          }
          else if (config.type === "generator") {
            // Prune all materializers (as they are all about to be re-run)
            Object.keys(variables[thisLocale]._matStatus).forEach(mid => {
              Object.keys(variables[thisLocale]._matStatus[mid]).forEach(k => {
                delete variables[thisLocale][k]; 
              });
              delete variables[thisLocale]._matStatus[mid];
            });
            // We only arrive here in the case of zero-length generators. Zero length generators STILL NEED to use 
            // the special built-in attributes, to handle the case of new profiles (and generator-less profiles)
            const genStub = {...attributes, _genStatus: {attributes}};
            variables[thisLocale] = assign({}, variables[thisLocale], genStub);
            axios.post(`${getStore().env.CANON_API}/api/materializers/${currentPid}?locale=${thisLocale}${paramString}`, {variables: variables[thisLocale]}).then(mat => {
              variables[thisLocale] = assign({}, variables[thisLocale], mat.data);
              const diffCounter = getStore().cms.status.diffCounter + 1;
              dispatch({type: "VARIABLES_SET", data: {id: currentPid, diffCounter, variables}});
              dispatch({type: "VARIABLES_FETCHED"});
            });
          }
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
            
            axios.post(`${getStore().env.CANON_API}/api/generators/${currentPid}?locale=${thisLocale}${paramString}`, {attributes}).then(gen => {
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
                  const diffCounter = getStore().cms.status.diffCounter + 1;
                  dispatch({type: "VARIABLES_SET", data: {id: currentPid, diffCounter, variables}});
                  dispatch({type: "VARIABLES_FETCHED"});
                });
              }
            });
          }
        }
      }
    }
  };
}










