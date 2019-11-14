import {connect} from "react-redux";
import React, {Component} from "react";
import {hot} from "react-hot-loader/root";
import {NonIdealState, Alert, Intent} from "@blueprintjs/core";
import PropTypes from "prop-types";
import Button from "../components/fields/Button";
import StoryEditor from "./StoryEditor";
import StorySectionEditor from "./StorySectionEditor";

import {swapEntity, newEntity, deleteEntity} from "../actions/profiles";
import {getStories, newStory, deleteStory} from "../actions/stories";
import {setStatus} from "../actions/status";
import {getFormatters} from "../actions/formatters";

class StoryBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      
    };
  }

  componentDidMount() {
    this.props.getStories();
  }

  moveItem(n) {
    this.props.swapEntity(n.itemType, n.data.id);
  }

  addItem(n) {
    this.props.newEntity("storysection", {story_id: n.data.story_id});
  }

  confirmDelete(n) {
    this.setState({nodeToDelete: n});
  }

  deleteItem(n) {
    if (n.itemType === "storysection") this.props.deleteEntity("storysection", {id: n.data.id});
    if (n.itemType === "story") this.props.deleteStory(n.data.id);
    this.setState({nodeToDelete: false});
  }

  createStory() {
    this.props.newStory();
  }

  render() {

    const {nodeToDelete} = this.state;
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
              ? <Editor id={id} />
              : <NonIdealState title="No Story Selected" description="Please select a Story from the menu above." visual="path-search" />
            }
          </div>
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
      </React.Fragment>
    );
  }
}

StoryBuilder.contextTypes = {
  formatters: PropTypes.object
};


const mapStateToProps = state => ({
  status: state.cms.status,
  stories: state.cms.stories
});

const mapDispatchToProps = dispatch => ({
  getStories: () => dispatch(getStories()),
  newStory: () => dispatch(newStory()),
  deleteStory: id => dispatch(deleteStory(id)),
  newEntity: (type, payload) => dispatch(newEntity(type, payload)),
  swapEntity: (type, id) => dispatch(swapEntity(type, id)),
  deleteEntity: (type, payload) => dispatch(deleteEntity(type, payload)),
  setStatus: status => dispatch(setStatus(status)),
  getFormatters: () => dispatch(getFormatters())
});

export default connect(mapStateToProps, mapDispatchToProps)(hot(StoryBuilder));
