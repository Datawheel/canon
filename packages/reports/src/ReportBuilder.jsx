/* react */
import React, {useEffect, useState, useCallback} from "react";
import {useDispatch, useSelector} from "react-redux";
import yn from "yn";
import {MantineProvider} from "@mantine/core";

/* components */
import Loading from "$app/components/Loading";
// import AuthForm from "./components/interface/AuthForm";
import ReportPicker from "./reports/ReportPicker";
import ReportEditor from "./reports/ReportEditor";

/* hooks */
import {ConfirmationDialogProvider} from "./reports/hooks/interactions/ConfirmationDialog";

/* redux */
import {fetchData, isAuthenticated} from "@datawheel/canon-core";
import {getFormatters} from "./actions/formatters";
import {setStatus} from "./actions/status";
import {getReports} from "./actions/reports";

/**
 * Builder - The outermost component of the CMS, exported in index.js, and embedded in a canon site.
 */
function ReportBuilder({router}) {

  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);

  /* redux */
  const auth = useSelector(state => state.auth);
  const env = useSelector(state => state.env);
  const formatterFunctions = useSelector(state => state.cms.resources.formatterFunctions);
  const isEnabled = useSelector(state => state.data.isEnabled);
  const minRole = useSelector(state => state.data.minRole);
  const pathObj = useSelector(state => state.cms.status.pathObj);

  const loadReports = useCallback(() => {
    setLoading(true);
    dispatch(getReports()).then(() => {
      setLoading(false);
    });
  }, []);

  /* mount */
  useEffect(() => {
    // todo1.0 memoize these with usecallback and promise (fran)
    dispatch(isAuthenticated());
    // todo1.0 potentially move formatters out of redux, and more importantly, locale/status stuff
    dispatch(getFormatters());
    loadReports();
    // Retrieve the langs from canon vars, use it to build the second language select dropdown.
    const localeDefault = env.CANON_LANGUAGE_DEFAULT || "en";
    const localeCurrent = localeDefault;
    const locales = env.CANON_LANGUAGES?.includes(",") ? env.CANON_LANGUAGES.split(",").filter(l => l !== localeDefault) : undefined;
    const localeSecondary = null;
    const {report, section, previews} = router.location.query;
    const pathObj = {report, previews, section};
    dispatch(setStatus({localeDefault, localeSecondary, localeCurrent, locales, pathObj}));
    // Prevent leaving the page accidentally, disabled during heavy 1.0 development
    /*
    const unload = e => e.returnValue = "Are you sure you want to leave?";
    if (typeof window !== "undefined") window.addEventListener("beforeunload", unload);
    return () => {
      if (typeof window !== "undefined")  window.addEventListener("beforeunload", unload);
    };
    */
  }, []);

  const pathObjString = `${pathObj?.report}-${pathObj.section}-${typeof pathObj?.previews === "string" ? pathObj?.previews : pathObj?.previews?.map(d => d.memberSlug).join()}`;

  // todo1.0 make routing work
  useEffect(() => {
    const {pathname} = router.location;
    const params = {
      report: pathObj?.report,
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
  if (!formatterFunctions) return <Loading />;
  // The CMS is only accessible on localhost/dev. Redirect the user to root otherwise.
  if (!isEnabled && typeof window !== "undefined" && window.location.pathname !== "/") window.location = "/";
  // Prevent accidental back swipes while working in the admin panel
  if (typeof window !== "undefined") document.querySelector("body").setAttribute("style", "overscroll-behavior-x: contain;");

  const pathname = router.location.pathname.charAt(0) !== "/" ? `/${router.location.pathname}` : router.location.pathname;

  if (yn(env.CANON_LOGINS) && !auth.user) return <AuthForm redirect={pathname}/>;

  if (yn(env.CANON_LOGINS) && auth.user && !isNaN(minRole) && auth.user.role < minRole) {
    return <div>auth form coming soon</div>;
    { /* <AuthForm redirect={pathname} error={true} auth={auth} /> */ } //eslint-disable-line
  }

  if (loading) return <Loading />;

  return (
    <MantineProvider>
      <ConfirmationDialogProvider>
        {pathObj.report
          ? <ReportEditor id={Number(pathObj.report)}/>
          : <ReportPicker />
        }
      </ConfirmationDialogProvider>
    </MantineProvider>
  );

}

ReportBuilder.need = [
  fetchData("isEnabled", "/api/cms"),
  fetchData("minRole", "/api/cms/minRole")
];

export default ReportBuilder;
