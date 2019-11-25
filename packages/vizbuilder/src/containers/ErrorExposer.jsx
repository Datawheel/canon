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
    title = t("Vizbuilder.error.network_title");
    detail = t("Vizbuilder.error.network_detail");
    action = undefined;
  }
  else if (errorName === "NoChartsError") {
    title = t("Vizbuilder.error.nocharts_title");
    detail = t("Vizbuilder.error.nocharts_detail");
  }
  else if (errorName === "DataOverloadError") {
    title = t("Vizbuilder.error.overload_title");
    detail = t("Vizbuilder.error.overload_detail");
    action = undefined;
  }
  else if (errorName === "EmptyDatasetError") {
    title = t("Vizbuilder.error.empty_title");
    detail = t("Vizbuilder.error.empty_detail");
  }
  else if (errorName === "ServerError") {
    title = t("Vizbuilder.error.server_title");
    detail = t("Vizbuilder.error.server_detail");
  }
  else if (errorName === "InternalError") {
    title = t("Vizbuilder.error.internal_title");
    detail = t("Vizbuilder.error.internal_detail");
  }
  else {
    title = t("Vizbuilder.error.unknown_title");
    detail = t("Vizbuilder.error.unknown_detail");
  }

  if (errorMsg) {
    detail = t("Vizbuilder.error.message", {message: errorMsg}) + "\n" + detail;
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
