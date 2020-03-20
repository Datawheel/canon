import React, {Component} from "react";
import PropTypes from "prop-types";
import Loading from "components/Loading";
import Deck from "../components/interface/Deck";
import {connect} from "react-redux";

import TextCard from "../components/cards/TextCard";

import "./ProfileEditor.css";

class ProfileEditor extends Component {

  render() {

    const {minData} = this.props;
    const {children} = this.props;
    const {localeDefault, localeSecondary} = this.props.status;
    const {variables} = this.props.status;

    const dataLoaded = minData;
    const varsLoaded = variables;
    const defLoaded = localeSecondary || variables && !localeSecondary && variables[localeDefault];
    const locLoaded = !localeSecondary || variables && localeSecondary && variables[localeDefault] && variables[localeSecondary];

    if (!dataLoaded || !varsLoaded || !defLoaded || !locLoaded) return <Loading />;

    return (
      <div className="cms-editor-inner">

        {/* search profiles */}
        {children}

        {/* profile meta */}
        {/* TODO: move to sidebar under new tab */}
        <Deck
          title="Profile meta"
          subtitle="Profile title"
          entity="splash"
          wrapperClassName="cms-splash-wrapper"
          cards={
            <TextCard
              minData={minData}
              fields={["title", "subtitle", "label"]}
              type="profile"
              hideAllowed={true}
            />
          }
        />
      </div>
    );
  }
}

ProfileEditor.contextTypes = {
  formatters: PropTypes.object
};

const mapStateToProps = (state, ownProps) => ({
  status: state.cms.status,
  minData: state.cms.profiles.find(p => p.id === ownProps.id)
});

export default connect(mapStateToProps)(ProfileEditor);
