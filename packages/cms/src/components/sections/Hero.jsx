import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import stripP from "../../utils/formatters/stripP";
import "./Section.css";

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
          <h1 className="cp-hero-title">
            {stripP(contents.title || profile.title)}
          </h1>
          {profile.subtitle
            ? <p className="cp-hero-subtitle" dangerouslySetInnerHTML={{__html: stripP(profile.subtitle)}} /> : ""
          }
        </div>
      </header>
    );
  }
}

export default connect(state => ({
  locale: state.i18n.locale
}))(Hero);
