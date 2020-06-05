import axios from "axios";
import {assign} from "d3plus-common";
import deepClone from "../utils/deepClone";
import getLocales from "../utils/getLocales";
import attify from "../utils/attify";
import groupMeta from "../utils/groupMeta";

const catcher = e => {
  console.log(`Error in profile action: ${e}`);
  return {data: {}};
};

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
export function duplicateEntity(type, payload) { 
  return function(dispatch, getStore) {
    return axios.post(`${getStore().env.CANON_API}/api/cms/${type}/duplicate`, payload)
      .then(({data}) => {
        dispatch({type: `${type.toUpperCase()}_DUPLICATE`, data});
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
    dispatch({type: "CLEAR_UPDATED"});
    // Updates might need to trigger re-running certain displays. Use diffCounter to track changes
    const diffCounter = getStore().cms.status.diffCounter + 1;
    // Formatters require locales in the payload to know what languages to compile for
    const locales = getLocales(getStore().env);
    return axios.post(`${getStore().env.CANON_API}/api/cms/${type}/update`, payload)
      .then(resp => {
        if (resp.status === 200) {
          dispatch({type: `${type.toUpperCase()}_UPDATE`, data: resp.data, diffCounter, locales});
        }
        else {
          dispatch({type: `${type.toUpperCase()}_ERROR`, data: {id: payload.id}});
        }
      }).catch(() => {
        dispatch({type: `${type.toUpperCase()}_ERROR`, data: {id: payload.id}});
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
    const {variables} = getStore().cms;
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
    const {variables} = getStore().cms;

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
      dispatch({type: "VARIABLES_SET", data: {variables}});
    }
  };
}

/** */
export function resetPreviews() { 
  return async function(dispatch, getStore) {
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
    const resps = await Promise.all(requests).catch(catcher);
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
  };
}

/**
 * Certain events in the Editors, such as saving a generator, can change the resulting
 * variables object. In order to ensure that this new variables object is passed down to
 * all the editors, each editor has a callback that accesses this function. We store the
 * variables object in a hash that is keyed by the profile id.
 */
export function fetchVariables(config) { 
  return async function(dispatch, getStore) { 
    dispatch({type: "VARIABLES_FETCH", data: "Generators"});
    const {previews, localeDefault, localeSecondary, currentPid} = getStore().cms.status;
    const {auth} = getStore();

    const thisProfile = getStore().cms.profiles.find(p => p.id === currentPid);
    let variables = deepClone(getStore().cms.variables);
    if (!variables) variables = {};
    if (!variables[localeDefault]) variables[localeDefault] = {_genStatus: {}, _matStatus: {}};
    if (localeSecondary && !variables[localeSecondary]) variables[localeSecondary] = {_genStatus: {}, _matStatus: {}};

    // useCache will be true if the front-end is telling us we have the variables already. Short circuit the gets/puts
    // However, still increment diffCounter so a re-render happens on cards that rely on variables.
    // NOTE: Disabling useCache for now as it doesn't work as intended - We would need to also store the latest "preview"
    // of the previously loaded profile, so that loading its variable state matches its new previews. Until this is implemented,
    // useCache will result in misleading states. Revisit this during the Navbar/handleclick Refactor.
    
    /*
    if (useCache && thisProfile.variables) {
      const diffCounter = getStore().cms.status.diffCounter + 1;
      dispatch({type: "VARIABLES_SET", data: {id: currentPid, variables: deepClone(thisProfile.variables), diffCounter}});
      dispatch({type: "VARIABLES_FETCHED"});
    }
    */

    const locales = [localeDefault];
    if (localeSecondary) locales.push(localeSecondary);
    
    const magicURL = `/api/cms/customAttributes/${currentPid}`;
    const attributesByLocale = {};
    for (const thisLocale of locales) {
      const theseAttributes = attify(previews.map(d => d.searchObj), thisLocale);
      if (getStore().env.CANON_LOGINS && auth.user) {
        const {password, salt, ...user} = auth.user; // eslint-disable-line
        theseAttributes.user = user;
        // Bubble up userRole for easy access in front end (for hiding sections based on role)
        theseAttributes.userRole = user.role;
      }
      const magicResp = await axios.post(magicURL, {variables: theseAttributes, locale: thisLocale}).catch(() => ({data: {}}));
      attributesByLocale[thisLocale] = theseAttributes;
      if (typeof magicResp.data === "object") attributesByLocale[thisLocale] = {...attributesByLocale[thisLocale], ...magicResp.data};
    }

    for (const thisLocale of locales) {
      const attributes = attributesByLocale[thisLocale];
      let paramString = previews.reduce((acc, p, i) => `${acc}&slug${i + 1}=${p.slug}&id${i + 1}=${p.id}`, "");
      if (config && (config.type === "materializer" || config.type === "generator")) paramString += `&${config.type}=${config.id}`;
      if (!config || config && config.type === "generator") {
        // If given a config, clear that generator. If not given a config, this is a first run, clear everything.
        const gids = config ? [config.id] : thisProfile.generators.map(d => d.id);
        for (const gid of gids) {
          if (variables[thisLocale]._genStatus[gid]) {
            Object.keys(variables[thisLocale]._genStatus[gid]).forEach(k => {
              delete variables[thisLocale][k];
            });
          }
          delete variables[thisLocale]._genStatus[gid];
        }
        const gen = await axios.post(`${getStore().env.CANON_API}/api/generators/${currentPid}?locale=${thisLocale}${paramString}`, {attributes}).catch(catcher);
        variables[thisLocale] = assign({}, variables[thisLocale], gen.data);
      }
      dispatch({type: "VARIABLES_FETCH", data: "Materializers"});
      // Clean out stale materializers
      Object.keys(variables[thisLocale]._matStatus).forEach(mid => {
        Object.keys(variables[thisLocale]._matStatus[mid]).forEach(k => {
          delete variables[thisLocale][k]; 
        });
        delete variables[thisLocale]._matStatus[mid];
      });
      const mat = await axios.post(`${getStore().env.CANON_API}/api/materializers/${currentPid}?locale=${thisLocale}${paramString}`, {variables: variables[thisLocale]}).catch(catcher);
      variables[thisLocale] = assign({}, variables[thisLocale], mat.data);
      const diffCounter = getStore().cms.status.diffCounter + 1;
      dispatch({type: "VARIABLES_SET", data: {variables}});
      dispatch({type: "VARIABLES_DIFF", data: {diffCounter}});
      dispatch({type: "VARIABLES_FETCHED"});
    }
  };
}










