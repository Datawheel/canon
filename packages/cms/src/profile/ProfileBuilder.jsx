import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {NonIdealState} from "@blueprintjs/core";
import ProfileEditor from "./ProfileEditor";
import SectionEditor from "./SectionEditor";
import PropTypes from "prop-types";
import DimensionBuilder from "../profile/DimensionBuilder";
import Button from "../components/fields/Button";
import Header from "../components/interface/Header";
import Toolbox from "../components/interface/Toolbox";
import Status from "../components/interface/Status";

import {resetPreviews} from "../actions/profiles";

import "./ProfileBuilder.css";

class ProfileBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      toolboxVisible: true
    };
  }

  componentDidMount() {
    // Prevents the user from accidentally leaving the page with a back/reload action. setTimeout is necessary here to
    // avoid a spurious Alert that would pop up when users log in using AuthForm (which fires a necessary redirect)
    if (typeof window !== "undefined") {
      setTimeout(() => window.onbeforeunload = () => "Are you sure you want to leave?", 3000);
    }
  }

  componentDidUpdate(prevProps) {
    const {currentPid} = this.props.status;
    const oldMeta = JSON.stringify(prevProps.profiles.map(p => JSON.stringify(p.meta)));
    const newMeta = JSON.stringify(this.props.profiles.map(p => JSON.stringify(p.meta)));
    const changedMeta = oldMeta !== newMeta;
    const changedFromStories = prevProps.status.pathObj.tab === "stories" && this.props.status.pathObj.tab === "profiles";

    if (currentPid && (changedMeta || changedFromStories)) {
      console.log("Meta Changed: Resetting Previews");
      this.props.resetPreviews();
    }
  }

  /**
   * Viz.jsx misbehaves when connecting directly to redux. Pass onSetVariables to Viz.jsx via context.
   */
  getChildContext() {
    return {
      onSetVariables: this.props.setVariables
    };
  }

  render() {

    const {toolboxVisible} = this.state;
    const {currentPid, fetchingVariables, pathObj, previews, profilesLoaded, searchLoading} = this.props.status;

    const type = pathObj.section ? "section" : pathObj.profile ? "profile" : null;
    const editorTypes = {profile: ProfileEditor, section: SectionEditor};
    const Editor = editorTypes[type];
    const id = pathObj.section ? Number(pathObj.section) : pathObj.profile ? Number(pathObj.profile) : null;

    const gensRecompiling = fetchingVariables;
    const gensBusy = `Loading ${fetchingVariables}...`;
    const gensDone = "Variables Loaded";

    const searchRecompiling = searchLoading;
    const searchBusy = "Loading search members...";
    const searchDone = "Members loaded";

    if (!profilesLoaded) return null;

    return (
      <Fragment>
        <div className="cms-panel profile-panel" id="profile-builder">
          <div className={`cms-editor${toolboxVisible ? " cms-multicolumn-editor" : ""}`} id="item-editor">
            {Editor && currentPid
              ? <Editor id={id}>
                <Header dimensions={previews || []}/>
                <DimensionBuilder />
              </Editor>
              : <NonIdealState title="No Profile Selected" description="Please select a Profile from the menu above." visual="path-search" />
            }

            <Toolbox
              id={currentPid}
              parentType="profile"
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
          </div>
        </div>

        <Status
          recompiling={gensRecompiling || searchRecompiling}
          busy={gensRecompiling ? gensBusy : searchBusy}
          done={gensRecompiling ? gensDone : searchDone}
        />
      </Fragment>
    );
  }
}

ProfileBuilder.childContextTypes = {
  onSetVariables: PropTypes.func
};

const mapStateToProps = state => ({
  profiles: state.cms.profiles,
  status: state.cms.status
});

const mapDispatchToProps = dispatch => ({
  resetPreviews: () => dispatch(resetPreviews())
});

export default connect(mapStateToProps, mapDispatchToProps)(ProfileBuilder);
