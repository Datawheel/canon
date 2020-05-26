import {AnchorButton} from "@blueprintjs/core";
import formUrlEncode from "form-urlencoded";
import React from "react";
import {withNamespaces} from "react-i18next";
import {connect} from "react-redux";
import {selectPermalink} from "../store/query/selectors";

/**
 * @typedef OwnProps
 * @property {string} error
 * @property {string | undefined} [message]
 */

/**
 * @typedef StateProps
 * @property {any} location
 * @property {string} permalink
 */

/** @type {React.FC<import("react-i18next").WithNamespaces & OwnProps & StateProps>} */
const IssueButton = ({error, location, message, permalink, t}) => {
  const issueParams = formUrlEncode({
    body: [
      `**Permalink**: ${location.origin + location.pathname}?${permalink}`,
      `**Error**: ${error}`,
      message ? `**Error details:** ${message}\n` : "",
      "**Detail of the issue:**\n"
    ].join("\n"),
    title: `[report/vizbuilder${location.pathname}] `
  });

  return (
    <AnchorButton
      href={`https://github.com/Datawheel/canon/issues/new?${issueParams}`}
      rel="noopener noreferrer"
      target="_blank"
      text={t("Vizbuilder.action_fileissue")}
    />
  );
};

/** @type {import("react-redux").MapStateToProps<StateProps, {}, GeneralState>} */
function mapState(state) {
  return {
    location: state.location,
    permalink: selectPermalink(state)
  };
}

export default withNamespaces()(connect(mapState)(IssueButton));
