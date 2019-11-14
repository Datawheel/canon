import {connect} from "react-redux";
import React, {Component} from "react";
import {hot} from "react-hot-loader/root";
import {NonIdealState} from "@blueprintjs/core";
import StoryEditor from "./StoryEditor";
import StorySectionEditor from "./StorySectionEditor";
import Header from "../components/interface/Header";

import {setStatus} from "../actions/status";

class StoryBuilder extends Component {

  render() {

    const {pathObj, storiesLoaded, currentStoryPid} = this.props.status;

    const type = pathObj.storysection ? "storysection" : pathObj.story ? "story" : null;
    const editorTypes = {story: StoryEditor, storysection: StorySectionEditor};
    const Editor = editorTypes[type];
    const id = pathObj.storysection ? Number(pathObj.storysection) : pathObj.story ? Number(pathObj.story) : null;

    if (!storiesLoaded) return null;

    return (
      <React.Fragment>
        <div className="cms-panel story-panel" id="profile-builder">
          <div className="cms-editor" id="item-editor">
            { Editor && currentStoryPid
              ? <Editor id={id}>
                <Header/>
              </Editor>
              : <NonIdealState title="No Story Selected" description="Please select a Story from the menu above." visual="path-search" />
            }
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  status: state.cms.status,
  stories: state.cms.stories
});

const mapDispatchToProps = dispatch => ({
  setStatus: status => dispatch(setStatus(status))
});

export default connect(mapStateToProps, mapDispatchToProps)(hot(StoryBuilder));
