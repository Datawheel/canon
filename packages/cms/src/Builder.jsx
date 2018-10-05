import libs from "./utils/libs";
import React, {Component} from "react";
import {Tab2, Tabs2} from "@blueprintjs/core";
import PropTypes from "prop-types";
import ProfileBuilder from "./profile/ProfileBuilder";
import StoryBuilder from "./story/StoryBuilder";
import {fetchData} from "@datawheel/canon-core";
import {connect} from "react-redux";

import "./Builder.css";

class Builder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentTab: "profile",
      formatters: (props.formatters || []).reduce((acc, d) => {
        const f = Function("n", "libs", "formatters", d.logic);
        const fName = d.name.replace(/^\w/g, chr => chr.toLowerCase());
        acc[fName] = n => f(n, libs, acc);
        return acc;
      }, {})
    };
  }

  getChildContext() {
    const {formatters} = this.state;
    return {formatters};
  }

  handleTabChange(e) {
    this.setState({currentTab: e});
  }

  render() {

    return (
      <div id="builder">
        <Tabs2 id="tabs" onChange={this.handleTabChange.bind(this)} selectedTabId={this.state.currentTab}>
          <Tab2 id="profile" title="Profiles" panel={<ProfileBuilder />} />
          <Tab2 id="story" title="Stories" panel={<StoryBuilder />} />
        </Tabs2>
      </div>
    );
  }
}

Builder.childContextTypes = {
  formatters: PropTypes.object
};

Builder.need = [
  fetchData("formatters", "/api/formatters")
];

export default connect(state => ({formatters: state.data.formatters}))(Builder);
