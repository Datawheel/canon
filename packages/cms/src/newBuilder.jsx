import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import yn from "yn";

import {fetchData, isAuthenticated} from "@datawheel/canon-core";

import AuthForm from "./components/interface/AuthForm";
import ProfilePicker from "./newLayout/ProfilePicker";
import ProfileEditor from "./newLayout/ProfileEditor";

import {getFormatters} from "./actions/formatters";
import {setStatus} from "./actions/status";

import "./newBuilder.css";

/**
 * Builder - The outermost component of the CMS, exported in index.js, and embedded in a canon site.
 */
function NewBuilder({router}) {

  const dispatch = useDispatch();

  /* redux */
  const {auth, env, formatterFunctions, isEnabled, minRole, pathObj} = useSelector(state => ({
    auth: state.auth,
    env: state.env,
    formatterFunctions: state.cms.resources.formatterFunctions,
    isEnabled: state.data.isEnabled,
    minRole: state.data.minRole,
    pathObj: state.cms.status.pathObj
  }));

  /* mount */
  useEffect(() => {
    dispatch(isAuthenticated());
    dispatch(getFormatters());
    // Retrieve the langs from canon vars, use it to build the second language select dropdown.
    const localeDefault = env.CANON_LANGUAGE_DEFAULT || "en";
    const locales = env.CANON_LANGUAGES?.includes(",") ? env.CANON_LANGUAGES.split(",").filter(l => l !== localeDefault) : undefined;
    const localeSecondary = null;
    const {profile, section, previews} = router.location.query;
    const pathObj = {profile, previews, section};
    dispatch(setStatus({localeDefault, localeSecondary, locales, pathObj}));
    // When the user leaves the page to view the front-end profile, clear the back/reload blocker that was
    // only meant for the CMS (prevents the popup from erroneously occuring when the user tries to leave the front-end)
    return () => {
      if (typeof window !== "undefined") window.onbeforeunload = () => undefined;
    };
  }, []);

  const pathObjString = `${pathObj?.profile}-${pathObj.section}-${typeof pathObj?.previews === "string" ? pathObj?.previews : pathObj?.previews?.map(d => d.memberSlug).join()}`;

  // todo1.0 make routing work
  useEffect(() => {
    const {pathname} = router.location;
    const params = {
      profile: pathObj?.profile,
      section: pathObj?.section
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

  return (
    <div className="cms-profile-browser">
      {pathObj.profile
        ? <ProfileEditor id={pathObj.profile}/>
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
