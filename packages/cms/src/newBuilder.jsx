import React, {useEffect, useState, useCallback} from "react";
import {useDispatch, useSelector} from "react-redux";
import yn from "yn";

import {fetchData, isAuthenticated} from "@datawheel/canon-core";

import AuthForm from "./components/interface/AuthForm";
import ProfilePicker from "./newLayout/ProfilePicker";
import ProfileEditor from "./newLayout/ProfileEditor";

import {getFormatters} from "./actions/formatters";
import {setStatus} from "./actions/status";
import {getProfiles} from "./actions/profiles";

import "./newBuilder.css";

/**
 * Builder - The outermost component of the CMS, exported in index.js, and embedded in a canon site.
 */
function NewBuilder({router}) {

  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);

  /* redux */
  const {auth, env, formatterFunctions, isEnabled, minRole, pathObj} = useSelector(state => ({
    auth: state.auth,
    env: state.env,
    formatterFunctions: state.cms.resources.formatterFunctions,
    isEnabled: state.data.isEnabled,
    minRole: state.data.minRole,
    pathObj: state.cms.status.pathObj
  }));

  const loadProfiles = useCallback(() => {
    setLoading(true);
    dispatch(getProfiles()).then(() => {
      setLoading(false);
    });
  }, []);

  /* mount */
  useEffect(() => {
    // todo1.0 memoize these with usecallback and promise (fran)
    dispatch(isAuthenticated());
    dispatch(getFormatters());
    loadProfiles();
    // Retrieve the langs from canon vars, use it to build the second language select dropdown.
    const localeDefault = env.CANON_LANGUAGE_DEFAULT || "en";
    const localeCurrent = localeDefault;
    const locales = env.CANON_LANGUAGES?.includes(",") ? env.CANON_LANGUAGES.split(",").filter(l => l !== localeDefault) : undefined;
    const localeSecondary = null;
    const {profile, section, previews} = router.location.query;
    const pathObj = {profile, previews, section};
    dispatch(setStatus({localeDefault, localeSecondary, localeCurrent, locales, pathObj}));
    // Prevent leaving the page accidentally
    /*
    const unload = e => e.returnValue = "Are you sure you want to leave?";
    if (typeof window !== "undefined") window.addEventListener("beforeunload", unload);
    return () => {
      if (typeof window !== "undefined")  window.addEventListener("beforeunload", unload);
    };
    */
  }, []);

  const pathObjString = `${pathObj?.profile}-${pathObj.section}-${typeof pathObj?.previews === "string" ? pathObj?.previews : pathObj?.previews?.map(d => d.memberSlug).join()}`;

  // todo1.0 make routing work
  useEffect(() => {
    const {pathname} = router.location;
    const params = {
      profile: pathObj?.profile,
      section: pathObj?.section,
      home: pathObj?.home
    };
    // Previews may come in as a string (from the URL) or an array (from the app).
    // Set the url correctly either way.
    if (pathObj?.previews) {
      params.previews = typeof pathObj?.previews === "string" ? pathObj?.previews : pathObj?.previews.map(d => d.memberSlug).join();
    }
    const hasParams = Object.values(params).some(d => d);
    if (hasParams) {
      const url = `${pathname}?${Object.keys(params).filter(d => params[d]).map(key => `${key}=${params[key]}`).join("&")}`;
      router.replace(url);
    }
  }, [pathObjString]);

  if (!isEnabled) return null;
  if (!formatterFunctions) return <div>Loading...</div>;
  // The CMS is only accessible on localhost/dev. Redirect the user to root otherwise.
  if (!isEnabled && typeof window !== "undefined" && window.location.pathname !== "/") window.location = "/";
  // Prevent accidental back swipes while working in the admin panel
  if (typeof window !== "undefined") document.querySelector("body").setAttribute("style", "overscroll-behavior-x: contain;");

  const pathname = router.location.pathname.charAt(0) !== "/" ? `/${router.location.pathname}` : router.location.pathname;

  if (yn(env.CANON_LOGINS) && !auth.user) return <AuthForm redirect={pathname}/>;

  if (yn(env.CANON_LOGINS) && auth.user && !isNaN(minRole) && auth.user.role < minRole) {
    return (
      <AuthForm redirect={pathname} error={true} auth={auth} />
    );
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="cms-profile-browser">
      {pathObj.profile
        ? <ProfileEditor id={Number(pathObj.profile)}/>
        : <ProfilePicker />
      }
    </div>
  );

}

NewBuilder.need = [
  fetchData("isEnabled", "/api/cms"),
  fetchData("minRole", "/api/cms/minRole")
];

export default NewBuilder;
