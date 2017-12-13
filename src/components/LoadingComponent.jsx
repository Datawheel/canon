import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {NonIdealState, ProgressBar} from "@blueprintjs/core";
import "./LoadingComponent.css";

class LoadingComponent extends Component {
  render() {
    const {progress, t, total} = this.props;
    return <NonIdealState className="LoadingComponent" title={ t("LoadingComponent.title") } description={ t("LoadingComponent.description", {progress, total}) } visual={<ProgressBar value={progress / total} />} />;
  }
}

LoadingComponent = translate()(connect(state => ({
  total: state.loadingProgress.requests,
  progress: state.loadingProgress.fulfilled
}))(LoadingComponent));

export default LoadingComponent;
export {LoadingComponent};
