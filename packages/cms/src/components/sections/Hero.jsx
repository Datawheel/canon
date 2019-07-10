import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import Parse from "./components/Parse";

import "./Section.css";
import "./Hero.css";

/** the profile hero, AKA header, AKA splash */
class Hero extends Component {

  constructor(props) {
    super(props);
    this.state = {
      contents: props.contents,
      loading: false,
      selectors: {},
      sources: []
    };
  }

  render() {
    const {contents, loading, sources, profile} = this.props;

    return (
      <header className="cp-section cp-hero">
        <div className="cp-section-inner cp-hero-inner">
          <Parse El="h1" className="cp-hero-title u-font-xxl">
            {contents ? contents.title : profile.title}
          </Parse>
          <Parse El="p" className="cp-hero-subtitle">
            {profile.subtitle}
          </Parse>
        </div>
      </header>
    );
  }
}

export default connect(state => ({
  locale: state.i18n.locale
}))(Hero);
