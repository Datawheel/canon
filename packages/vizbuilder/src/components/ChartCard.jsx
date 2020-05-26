import {Button, Intent} from "@blueprintjs/core";
import React, {Component} from "react";
import {withNamespaces} from "react-i18next";
import IssueButton from "../containers/IssueButton";

/**
 * @typedef OwnProps
 * @property {boolean} active
 * @property {boolean} [hideToolbar]
 * @property {() => void} onToggle
 */

/** @type {Component<import("react-i18next").WithNamespaces & OwnProps, {error?: string}>} */
class ChartCard extends Component {
  static getDerivedStateFromError(error) {
    return {error: error.message};
  }

  state = {
    error: undefined
  };

  clearError = () => this.setState({error: undefined});

  render() {
    const {active, chart: ChartComponent, hideToolbar, t, onToggle} = this.props;
    const {error} = this.state;

    if (error) {
      return (
        <div className="chart-card error">
          <div className="wrapper">
            <h3>{t("Vizbuilder.error.chartfail_title", {chart: ChartComponent.name})}</h3>
            <p>{t("Vizbuilder.error.chartfail_detail")}</p>
            <p>{t("Vizbuilder.error.message", {message: error})}</p>
            <p className="actions">
              <Button
                onClick={this.clearError}
                intent={Intent.PRIMARY}
                text={t("Vizbuilder.action_retry")}
              />
              <IssueButton error="ChartFailError" message={error} />
            </p>
          </div>
        </div>
      );
    }

    const buttonIcon = active ? "cross" : "zoom-in";
    const buttonText = active
      ? t("Vizbuilder.action_close")
      : t("Vizbuilder.action_enlarge");

    return (
      <div className="chart-card">
        <div className="wrapper">
          {!hideToolbar && <aside className="chart-toolbar">
            <Button minimal icon={buttonIcon} text={buttonText} onClick={onToggle} />
          </aside>}
          <ChartComponent config={this.props.config} />
        </div>
      </div>
    );
  }
}

export default withNamespaces()(ChartCard);
