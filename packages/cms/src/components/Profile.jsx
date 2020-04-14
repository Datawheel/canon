import React, {Component} from "react";
import {hot} from "react-hot-loader/root";
import {connect} from "react-redux";
import {fetchData} from "@datawheel/canon-core";
import PropTypes from "prop-types";
import ProfileRenderer from "./ProfileRenderer";
import {NonIdealState} from "@blueprintjs/core";
import "./Profile.css";

class Profile extends Component {
  getChildContext() {
    const {router, searchProps} = this.props;
    return {
      router,
      searchProps
    };
  }

  render() {
    const {profile, formatters, locale} = this.props;

    if (profile.error) {
      const {error, errorCode} = profile;
      const errorMessages = {
        404: "Page Not Found"
      };
      return (
        <NonIdealState
          className="cp-error"
          icon="error"
          title={errorMessages[errorCode] || `Error: ${errorCode}`}
          description={error}
        />
      );
    }

    return (
      <ProfileRenderer
        profile={profile}
        formatters={formatters}
        locale={locale}
      />
    );
  }
}

Profile.defaultProps = {
  searchProps: {}
};

Profile.need = [
  fetchData("profile", "/api/profile/?slug=<slug>&id=<id>&slug2=<slug2>&id2=<id2>&slug3=<slug3>&id3=<id3>&locale=<i18n.locale>"),
  fetchData("formatters", "/api/formatters")
];

Profile.childContextTypes = {
  router: PropTypes.object,
  searchProps: PropTypes.object
};

export default connect(state => ({
  formatters: state.data.formatters,
  locale: state.i18n.locale,
  profile: state.data.profile
}))(hot(Profile));
