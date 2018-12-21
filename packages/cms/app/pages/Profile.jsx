import React, {Component} from "react";
import PropTypes from "prop-types";
import {fetchData} from "@datawheel/canon-core";
import {connect} from "react-redux";
import {Topic} from "../../src";
import libs from "../../src/utils/libs";

class Profile extends Component {

  getChildContext() {
    const {formatters, profile, router} = this.props;
    const {variables} = profile;
    return {
      formatters: formatters.reduce((acc, d) => {
        const f = Function("n", "libs", "formatters", d.logic);
        const fName = d.name.replace(/^\w/g, chr => chr.toLowerCase());
        acc[fName] = n => f(n, libs, acc);
        return acc;
      }, {}),
      router,
      variables
    };
  }

  render() {
    const {sections, title} = this.props.profile;
    return (
      <div id="Profile">
        <h1 dangerouslySetInnerHTML={{__html: title}} />
        {sections.map(section => {
          const {id, topics} = section;
          return <div key={id}>
            <h2 dangerouslySetInnerHTML={{__html: section.title}} />
            { topics.map(topic => <Topic key={topic.slug} contents={topic} />) }
          </div>;
        })}
      </div>
    );
  }

}

Profile.childContextTypes = {
  formatters: PropTypes.object,
  router: PropTypes.object,
  variables: PropTypes.object
};

Profile.need = [
  fetchData("profile", "/api/profile/antibiotic-resistance/7"),
  fetchData("formatters", "/api/formatters")
];

export default connect(state => ({
  formatters: state.data.formatters,
  profile: state.data.profile
}))(Profile);
