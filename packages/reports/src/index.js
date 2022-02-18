import {chunkify} from "@datawheel/canon-core";

const ReportBuilder = chunkify(/* #__LOADABLE__ */ () => import(/* webpackChunkName: "report-builder" */ "./ReportBuilder.jsx"));
const MemberEditor = chunkify(/* #__LOADABLE__ */ () => import(/* webpackChunkName: "member-editor" */ "./reports/members/MemberEditor"));
const Report = chunkify(/* #__LOADABLE__ */ () => import(/* webpackChunkName: "member-editor" */ "./frontend/Report"));

export {
  MemberEditor,
  ReportBuilder,
  Report
};

// Redux
export {default as reportsReducer} from "./reducers/index.js";
