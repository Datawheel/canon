import React, {Component} from "react";
import {hot} from "react-hot-loader/root";
import {connect} from "react-redux";
import {fetchData} from "@datawheel/canon-core";
import PropTypes from "prop-types";
import SectionRenderer from "./SectionRenderer";

class Profile extends Component {

  getChildContext() {
    const {router} = this.props;
    return {
      router
    };
  }

  render() {

    const {profile, formatters, locale} = this.props;

    return (
      <SectionRenderer
        profile={profile}
        formatters={formatters}
        locale={locale}
      />
    );
  }
}

Profile.need = [
  fetchData("profile", "/api/profile/?slug=<slug>&id=<id>&slug2=<slug2>&id2=<id2>&slug3=<slug3>&id3=<id3>&locale=<i18n.locale>"),
  fetchData("formatters", "/api/formatters")
];

Profile.childContextTypes = {
  router: PropTypes.object
};

export default connect(state => ({
  formatters: state.data.formatters,
  locale: state.i18n.locale,
  profile: state.data.profile
}))(hot(Profile));
