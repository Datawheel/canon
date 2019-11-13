import React, {Component} from "react";
import {connect} from "react-redux";
import {hot} from "react-hot-loader/root";
import {NonIdealState, Intent, Alert} from "@blueprintjs/core";
import ProfileEditor from "./ProfileEditor";
import SectionEditor from "./SectionEditor";
import PropTypes from "prop-types";
import DimensionBuilder from "../profile/DimensionBuilder";
import Button from "../components/fields/Button";
import Header from "../components/interface/Header";
import Toolbox from "../components/interface/Toolbox";
import Status from "../components/interface/Status";

import {getProfiles, newProfile, swapEntity, newEntity, deleteEntity, deleteProfile, setVariables} from "../actions/profiles";
import {setStatus} from "../actions/status";
import {getCubeData} from "../actions/cubeData";
import {getFormatters} from "../actions/formatters";

import "./ProfileBuilder.css";

class ProfileBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      toolboxVisible: true
    };
  }

  /**
   * Viz.jsx misbehaves when connecting directly to redux. Pass onSetVariables to Viz.jsx via context.
   */
  getChildContext() {
    return {
      onSetVariables: this.props.setVariables
    };
  }

  componentDidMount() {
    this.props.getProfiles();
    this.props.getFormatters();
    this.props.getCubeData();
  }

  moveItem(n) {
    this.props.swapEntity(n.itemType, n.data.id);
  }

  addItem(n) {
    this.props.newEntity("section", {profile_id: n.data.profile_id});
  }

  confirmDelete(n) {
    this.setState({nodeToDelete: n});
  }

  deleteItem(n) {
    if (n.itemType === "section") this.props.deleteEntity("section", {id: n.data.id});
    if (n.itemType === "profile") this.props.deleteProfile(n.data.id);
    this.setState({nodeToDelete: false});
  }

  createProfile() {
    this.props.newProfile();
  }

  render() {

    const {nodeToDelete, toolboxVisible} = this.state;
    const {currentPid, gensLoaded, gensTotal, genLang, pathObj, previews} = this.props.status;

    const editorTypes = {profile: ProfileEditor, section: SectionEditor};
    const Editor = pathObj.section ? editorTypes.section : pathObj.profile ? editorTypes.profile : null;
    const id = pathObj.section ? pathObj.section : pathObj.profile ? pathObj.profile : null;

    return (
      <React.Fragment>
        <div className="cms-panel profile-panel" id="profile-builder">
          <div className={`cms-editor${toolboxVisible ? " cms-multicolumn-editor" : ""}`} id="item-editor">
            { Editor
              ? <Editor id={id}>
                <Header dimensions={previews}/>
                <DimensionBuilder />
              </Editor>
              : <NonIdealState title="No Profile Selected" description="Please select a Profile from the menu above." visual="path-search" />
            }

            <Toolbox
              id={currentPid}
              toolboxVisible={toolboxVisible}
            >
              <div className="cms-toolbox-collapse-wrapper u-hide-below-lg">
                <Button
                  className="cms-toolbox-collapse-button"
                  fontSize="xs"
                  icon={toolboxVisible ? "caret-right" : "caret-left"}
                  iconOnly
                  namespace="cms"
                  onClick={() => this.setState({toolboxVisible: !toolboxVisible})}
                >
                  {toolboxVisible ? "hide toolbox" : "show toolbox"}
                </Button>
              </div>
            </Toolbox>

            <Status
              recompiling={gensLoaded !== gensTotal}
              busy={`${gensLoaded} of ${gensTotal} Generators Loaded (${genLang})`}
              done="Variables Loaded"
            />
          </div>

          <Alert
            isOpen={nodeToDelete}
            cancelButtonText="Cancel"
            confirmButtonText="Delete"
            iconName="trash"
            intent={Intent.DANGER}
            onConfirm={() => this.deleteItem.bind(this)(nodeToDelete)}
            onCancel={() => this.setState({nodeToDelete: false})}
          >
            {nodeToDelete ? `Are you sure you want to delete the ${nodeToDelete.itemType} "${nodeToDelete.label}" and all its children? This action cannot be undone.` : ""}
          </Alert>
        </div>
      </React.Fragment>
    );
  }
}

ProfileBuilder.contextTypes = {
  formatters: PropTypes.object
};

ProfileBuilder.childContextTypes = {
  onSetVariables: PropTypes.func
};

const mapStateToProps = state => ({
  env: state.env,
  profiles: state.cms.profiles,
  selectors: state.cms.status.currentPid ? state.cms.profiles.find(p => p.id === state.cms.status.currentPid).selectors : [],
  status: state.cms.status
});

const mapDispatchToProps = dispatch => ({
  getProfiles: () => dispatch(getProfiles()),
  getCubeData: () => dispatch(getCubeData()),
  newProfile: () => dispatch(newProfile()),
  deleteProfile: id => dispatch(deleteProfile(id)),
  newEntity: (type, payload) => dispatch(newEntity(type, payload)),
  swapEntity: (type, id) => dispatch(swapEntity(type, id)),
  deleteEntity: (type, payload) => dispatch(deleteEntity(type, payload)),
  setStatus: status => dispatch(setStatus(status)),
  getFormatters: () => dispatch(getFormatters()),
  setVariables: newVariables => dispatch(setVariables(newVariables))
});

export default connect(mapStateToProps, mapDispatchToProps)(hot(ProfileBuilder));
