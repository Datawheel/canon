import {connect} from "react-redux";
import React, {Component} from "react";
import {NonIdealState} from "@blueprintjs/core";
import Button from "../components/fields/Button";
import StoryEditor from "./StoryEditor";
import StorySectionEditor from "./StorySectionEditor";
import Toolbox from "../components/interface/Toolbox";
import Header from "../components/interface/Header";

import {setStatus} from "../actions/status";

class StoryBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      toolboxVisible: true
    };
  }

  render() {

    const {pathObj, storiesLoaded, currentStoryPid} = this.props.status;
    const {toolboxVisible} = this.state;

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
            <Toolbox
              id={currentStoryPid}
              parentType="story"
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

export default connect(mapStateToProps, mapDispatchToProps)(StoryBuilder);
