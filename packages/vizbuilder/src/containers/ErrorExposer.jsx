import {NonIdealState} from "@blueprintjs/core";
import React from "react";
import {withNamespaces} from "react-i18next";
import {connect} from "react-redux";
import {selectLoadingState} from "../store/loading/selectors";
import IssueButton from "./IssueButton";

/**
 * @typedef StateProps
 * @property {string | undefined} errorName
 * @property {string | undefined} errorMsg
 * @property {boolean} isLoading
 */

/** @type {React.FC<import("react-i18next").WithNamespaces & LoadingState>} */
const ErrorExposer = function({errorMsg, errorName, inProgress, t}) {
  if (!errorName) {
    return null;
  }

  /** @type {JSX.Element | undefined} */
  let action = <IssueButton error={errorName} message={errorMsg} />;

  /** @type {import("@blueprintjs/core").IconName} */
  let icon = "error";

  /** @type {string} */
  let detail, title;

  const disconnected = typeof window === "object" && !window.navigator.onLine;

  if (inProgress) {
    return null;
  }
  else if (disconnected || errorName === "NetworkError") {
    action = undefined;
    detail = t("Vizbuilder.error.network_detail");
    icon = "globe-network";
    title = t("Vizbuilder.error.network_title");
  }
  else if (errorName === "NoChartsError") {
    detail = t("Vizbuilder.error.nocharts_detail");
    title = t("Vizbuilder.error.nocharts_title");
  }
  else if (errorName === "DataOverloadError") {
    action = undefined;
    detail = t("Vizbuilder.error.overload_detail");
    title = t("Vizbuilder.error.overload_title");
  }
  else if (errorName === "EmptyDatasetError") {
    detail = t("Vizbuilder.error.empty_detail");
    title = t("Vizbuilder.error.empty_title");
  }
  else if (errorName === "ServerError") {
    detail = t("Vizbuilder.error.server_detail");
    title = t("Vizbuilder.error.server_title");
  }
  else if (errorName === "InternalError") {
    detail = t("Vizbuilder.error.internal_detail");
    title = t("Vizbuilder.error.internal_title");
  }
  else {
    detail = t("Vizbuilder.error.unknown_detail");
    title = t("Vizbuilder.error.unknown_title");
    icon = "warning-sign";
  }

  if (errorMsg) {
    detail = `${t("Vizbuilder.error.message", {message: errorMsg})}\n${detail}`;
  }

  return (
    <NonIdealState
      className="error-message"
      action={action}
      description={detail}
      icon={icon}
      title={title}
    />
  );
};

/** @type {import("react-redux").MapStateToProps<LoadingState, {}, GeneralState>} */
function mapState(state) {
  return selectLoadingState(state);
}

export default withNamespaces()(connect(mapState)(ErrorExposer));
