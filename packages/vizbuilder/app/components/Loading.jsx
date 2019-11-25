import React from "react";
import {connect} from "react-redux";
import {withNamespaces} from "react-i18next";
import {NonIdealState, ProgressBar} from "@blueprintjs/core";
import "./Loading.css";

/**
 * @typedef OwnProps
 * @property {number} progress
 * @property {number} total
 */

/**
 * @typedef StateProps
 * @property {number} progress
 * @property {number} total
 */

/**
  This component is displayed when the needs of another component are being
  loaded into the redux store.

  @type {React.FC<import("react-i18next").WithNamespaces & OwnProps & StateProps>}
*/
const Loading = function({progress, t, total}) {
  const title = t("Loading.title");
  const description = t("Loading.description", {progress, total});
  return (
    <NonIdealState
      className="loading"
      icon={<ProgressBar value={progress / total} />}
      title={title}
      description={description}
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
function mergeProps(stateProps, _, ownProps) {
  return ownProps.total == null ? {...ownProps, ...stateProps} : ownProps;
}

export default withNamespaces()(connect(mapState, null, mergeProps)(Loading));
