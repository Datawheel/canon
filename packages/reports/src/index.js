import {chunkify} from "@datawheel/canon-core";

const ReportBuilder = chunkify(/* #__LOADABLE__ */ () => import(/* webpackChunkName: "report-builder" */ "./ReportBuilder.jsx"));
const MemberEditor = chunkify(/* #__LOADABLE__ */ () => import(/* webpackChunkName: "member-editor" */ "./reports/members/MemberEditor"));

export {
  MemberEditor,
  ReportBuilder
};

// Redux
export {default as reportsReducer} from "./reducers/index.js";
