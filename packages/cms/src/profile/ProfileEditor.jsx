import React, {Component} from "react";
import PropTypes from "prop-types";
import Loading from "components/Loading";
import Deck from "../components/interface/Deck";
import Select from "../components/fields/Select";
import {connect} from "react-redux";
import {updateEntity} from "../actions/profiles";
import deepClone from "../utils/deepClone";

import TextCard from "../components/cards/TextCard";

import "./ProfileEditor.css";

class ProfileEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null
    };
  }

  componentDidMount() {
    this.setState({minData: deepClone(this.props.minData)});
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.setState({minData: deepClone(this.props.minData)});
    }
  }

  changeVisibility(e) {
    const {minData} = this.state;
    minData.visible = e.target.value;
    const payload = {id: minData.id, visible: minData.visible};
    this.setState({minData});
    this.props.updateEntity("profile", payload);
  }

  render() {

    const {minData} = this.state;
    const {children, variables} = this.props;
    const {localeDefault, localeSecondary} = this.props.status;

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
              minData={this.props.minData}
              fields={["title", "subtitle", "label"]}
              type="profile"
              hideAllowed={true}
            />
          }
        />
        {/* visibility select */}
        <Select
          label="Profile Visibility"
          className="cms-profile-visible-selector"
          namespace="cms"
          fontSize="xs"
          inline
          value={minData.visible}
          onChange={this.changeVisibility.bind(this)}
        >
          <option key="true" value={true}>Visible</option>
          <option key="false" value={false}>Hidden</option>
        </Select>
      </div>
    );
  }
}

ProfileEditor.contextTypes = {
  formatters: PropTypes.object
};

const mapStateToProps = (state, ownProps) => ({
  variables: state.cms.variables,
  status: state.cms.status,
  minData: state.cms.profiles.find(p => p.id === ownProps.id)
});

const mapDispatchToProps = dispatch => ({
  updateEntity: (type, payload) => dispatch(updateEntity(type, payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(ProfileEditor);
