import React from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {NonIdealState, ProgressBar} from "@blueprintjs/core";
import "./Loading.css";

/**
 * @typedef OwnProps
 * @property {number} progress
 * @property {number} total
 * @property {(k: any, p?: any) => string} t
 */

/**
 * @typedef StateProps
 * @property {number} progress
 * @property {number} total
 */

/**
  This component is displayed when the needs of another component are being
  loaded into the redux store.

  @type {React.FC<OwnProps&StateProps>}
*/
const Loading = function({progress, t, total}) {
  return (
    <NonIdealState
      className="loading"
      icon={<ProgressBar value={progress / total} />}
      title={t("Loading.title")}
      description={t("Loading.description", {progress, total})}
    />
  );
};

/** @type {import("react-redux").MapStateToProps<StateProps, OwnProps, any>} */
function mapState(state) {
  return {
    total: state.loadingProgress.requests,
    progress: state.loadingProgress.fulfilled
  };
}

/** @type {import("react-redux").MergeProps<StateProps, {}, OwnProps, OwnProps>} */
function mergeProps(stateProps, dispatchProps, ownProps) {
  return ownProps.total == null ? {...ownProps, ...stateProps} : ownProps;
}

export default translate()(connect(mapState, null, mergeProps)(Loading));
