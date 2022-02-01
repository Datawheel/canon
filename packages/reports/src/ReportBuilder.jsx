/* react */
import React, {useEffect, useState, useCallback, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import yn from "yn";
import {MantineProvider} from "@mantine/core";
import {NotificationsProvider} from "@mantine/notifications";

/* components */
import Loading from "$app/components/Loading";
// import AuthForm from "./components/interface/AuthForm";
import ReportPicker from "./reports/reports/ReportPicker";
import ReportEditor from "./reports/reports/ReportEditor";

/* hooks */
import {ConfirmationDialogProvider} from "./reports/hooks/interactions/ConfirmationDialog";

/* redux */
import {fetchData, isAuthenticated} from "@datawheel/canon-core";
import {getFormatters} from "./actions/formatters";
import {setStatus} from "./actions/status";
import {getReports} from "./actions/reports";
import getLocales from "./utils/canon/getLocales";

/**
 * Builder - The outermost component of the CMS, exported in index.js, and embedded in a canon site.
 */
function ReportBuilder({router}) {

  const dispatch = useDispatch();

  /* redux */
  const auth = useSelector(state => state.auth);
  const env = useSelector(state => state.env);
  const formatterFunctions = useSelector(state => state.cms.resources.formatterFunctions);
  const reports = useSelector(state => state.cms.reports.entities);
  // todo1.0 bundle these into a "useAppReady" hook
  const isEnabled = useSelector(state => state.data.isEnabled);
  const minRole = useSelector(state => state.data.minRole);
  const pathObj = useSelector(state => state.cms.status.pathObj);
  const query = useSelector(state => state.cms.status.query);
  const currentReport = useSelector(state => state.cms.status.currentReport);

  const loadReports = useCallback(() => {
    dispatch(getReports());
    dispatch(getFormatters());
    dispatch(isAuthenticated());
  }, []);

  const isReady = useMemo(() => reports && formatterFunctions, [reports, formatterFunctions]);

  /* mount */
  useEffect(() => {
    loadReports();
    // Retrieve the langs from canon vars, use it to build the second language select dropdown.
    const localeDefault = env.CANON_LANGUAGE_DEFAULT || "en";
    const localeCurrent = localeDefault;
    const locales = getLocales(env);
    const localeSecondary = null;
    const {report, section, previews, ...query} = router.location.query;
    const pathObj = {report, section, previews: previews ? previews.split(",") : []};
    dispatch(setStatus({localeDefault, localeSecondary, localeCurrent, locales, pathObj, query}));

    // Prevent leaving the page accidentally, disabled during heavy 1.0 development todo1.0 remove
    /*
    const unload = e => e.returnValue = "Are you sure you want to leave?";
    if (typeof window !== "undefined") window.addEventListener("beforeunload", unload);
    return () => {
      if (typeof window !== "undefined")  window.addEventListener("beforeunload", unload);
    };
    */
  }, []);

  useEffect(() => {
    const {pathname} = router.location;
    let params = {
      report: pathObj?.report,
      section: pathObj?.section,
      home: pathObj?.home
    };
    if (pathObj?.previews) params.previews = pathObj?.previews.map(d => d.slug).join();
    if (query) params = {...params, ...query};
    const hasParams = Object.values(params).some(d => d);
    if (hasParams) {
      const url = `${pathname}?${Object.keys(params).filter(d => params[d]).map(key => `${key}=${params[key]}`).join("&")}`;
      router.replace(url);
    }
    if (params.report) dispatch(setStatus({currentReport: params.report})); // todo1.0 should this be done here?
  }, [pathObj, query]);

  // The CMS is only accessible on localhost/dev. Redirect the user to root otherwise.
  if (!isEnabled) {
    if (typeof window !== "undefined" && window.location.pathname !== "/") window.location = "/";
    return null;
  }

  if (!isReady) return <Loading />;

  // Prevent accidental back swipes while working in the admin panel
  if (typeof window !== "undefined") document.querySelector("body").setAttribute("style", "overscroll-behavior-x: contain;");

  const pathname = router.location.pathname.charAt(0) !== "/" ? `/${router.location.pathname}` : router.location.pathname;

  if (yn(env.CANON_LOGINS) && !auth.user) return <AuthForm redirect={pathname}/>;

  if (yn(env.CANON_LOGINS) && auth.user && !isNaN(minRole) && auth.user.role < minRole) {
    return <div>auth form coming soon</div>;
    { /* <AuthForm redirect={pathname} error={true} auth={auth} /> */ } //eslint-disable-line
  }

  return (
    <MantineProvider>
      <NotificationsProvider position="bottom-center">
        <ConfirmationDialogProvider>
          {pathObj.report && currentReport
            ? <ReportEditor id={Number(pathObj.report)}/>
            : <ReportPicker />
          }
        </ConfirmationDialogProvider>
      </NotificationsProvider>
    </MantineProvider>
  );

}

ReportBuilder.need = [
  fetchData("isEnabled", "/api/cms"),
  fetchData("minRole", "/api/cms/minRole")
];

export default ReportBuilder;
