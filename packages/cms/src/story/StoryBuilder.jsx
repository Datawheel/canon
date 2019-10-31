import {connect} from "react-redux";
import React, {Component} from "react";
import {hot} from "react-hot-loader/root";
import {NonIdealState, Alert, Intent} from "@blueprintjs/core";
import PropTypes from "prop-types";
import Button from "../components/fields/Button";
import CtxMenu from "../components/interface/CtxMenu";
import SidebarTree from "../components/interface/SidebarTree";
import StoryEditor from "./StoryEditor";
import StorySectionEditor from "./StorySectionEditor";
import treeifystory from "../utils/profile/treeifystory";

import {swapEntity, newEntity, deleteEntity} from "../actions/profiles";
import {getStories, newStory, deleteStory} from "../actions/stories";
import {setStatus} from "../actions/status";
import {getFormatters} from "../actions/formatters";

class StoryBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      nodes: null
    };
  }

  componentDidMount() {
    this.props.getStories();
  }

  componentDidUpdate(prevProps) {
    // Doing a JSON.Stringify is too expensive here - and we need to ONLY call buildNodes
    // If certain properties of the stories obj has changed. Use a DIY stringify to detect changes.
    const {nodes} = this.state;
    const oldTree = prevProps.stories.reduce((acc, p) => `${acc}-${p.id}-${p.storysections.map(s => s.id).join()}`, "");
    const newTree = this.props.stories.reduce((acc, p) => `${acc}-${p.id}-${p.storysections.map(s => s.id).join()}`, "");
    const changedTree = oldTree !== newTree;
    
    if (!nodes || changedTree) {
      console.log("Tree Changed: Rebuilding Tree");
      this.buildNodes.bind(this)();
    }
  }

  buildNodes(openNode) {
    const {stories} = this.props;
    const {localeDefault, pathObj} = this.props.status;
    const nodes = treeifystory(stories, localeDefault);
    if (!openNode) {
      const {story, storysection} = pathObj;
      let nodeToOpen;
      if (storysection) {
        nodeToOpen = this.locateNode("storysection", storysection, nodes);
        if (!nodeToOpen) nodeToOpen = nodes[0];
        this.setState({nodes}, this.handleNodeClick.bind(this, nodeToOpen));
      }
      else if (story) {
        nodeToOpen = this.locateNode("story", story, nodes);
        if (!nodeToOpen) nodeToOpen = nodes[0];
        this.setState({nodes}, this.handleNodeClick.bind(this, nodeToOpen));
      }
      else {
        this.setState({nodes});
      }
    }
    else {
      this.setState({nodes}, this.handleNodeClick.bind(this, nodes[0]));
    }
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

  handleNodeClick(node) {
    node = this.locateNode(node.itemType, node.data.id);
    const {nodes} = this.state;
    const {currentStoryNode} = this.props.status;
    let parentLength = 0;
    if (node.itemType === "storysection") parentLength = this.locateNode("story", node.data.story_id).childNodes.length;
    if (node.itemType === "story") parentLength = nodes.length;
    if (!currentStoryNode) {
      // If the node has a parent, it's a section. Expand its parent profile so we can see it.
      if (node.parent) node.parent.isExpanded = true;
      node.isSelected = true;
      node.isExpanded = true;
      node.secondaryLabel = <CtxMenu node={node} parentLength={parentLength} moveItem={this.moveItem.bind(this)} addItem={this.addItem.bind(this)} deleteItem={this.confirmDelete.bind(this)} />;
    }
    else if (node.id !== currentStoryNode.id) {
      node.isExpanded = true;
      node.isSelected = true;
      currentStoryNode.isSelected = false;
      node.secondaryLabel = <CtxMenu node={node} parentLength={parentLength} moveItem={this.moveItem.bind(this)} addItem={this.addItem.bind(this)} deleteItem={this.confirmDelete.bind(this)} />;
      currentStoryNode.secondaryLabel = null;
    }
    // This case is needed becuase, even if the same node is reclicked, its CtxMenu MUST update to reflect the new node (it may no longer be in its old location)
    else if (currentStoryNode && node.id === currentStoryNode.id) {
      node.secondaryLabel = <CtxMenu node={node} parentLength={parentLength} moveItem={this.moveItem.bind(this)} addItem={this.addItem.bind(this)} deleteItem={this.confirmDelete.bind(this)} />;
    }
    let ssParent;
    if (node.itemType === "storysection") ssParent = this.locateNode("story", node.data.story_id);
    const newPathObj = {
      story: node.itemType === "story" ? node.data.id : ssParent.data.id,
      storysection: node.itemType === "storysection" ? node.data.id : undefined
    };
    let clickedStoryPid;
    if (node.itemType === "story") clickedStoryPid = node.data.id;
    if (node.itemType === "storysection") clickedStoryPid = node.data.story_id;
    this.props.setStatus({currentStoryNode: node, currentStoryPid: clickedStoryPid, pathObj: newPathObj});
  }

  createStory() {
    this.props.newStory();
  }

  handleNodeCollapse(node) {
    node.isExpanded = false;
    this.setState({nodes: this.state.nodes});
  }

  handleNodeExpand(node) {
    node.isExpanded = true;
    this.setState({nodes: this.state.nodes});
  }

  /**
   * Given a node type (story, storysection) and an id, crawl down the tree and fetch a reference to the Tree node with that id
   */
  locateNode(type, id, pnodes) {
    const nodes = pnodes || this.state.nodes;
    let node = null;
    if (type === "story") {
      node = nodes.find(s => Number(s.data.id) === Number(id));
    }
    else if (type === "storysection") {
      nodes.forEach(s => {
        const attempt = s.childNodes.find(t => Number(t.data.id) === Number(id));
        if (attempt) {
          node = attempt;
          node.parent = nodes.find(s => Number(s.data.id) === Number(node.data.story_id)); // add parent to node
        }
      });
    }
    return node;
  }

  render() {

    const {nodes, nodeToDelete} = this.state;
    const {currentStoryNode} = this.props.status;

    if (!nodes) return null;

    return (
      <React.Fragment>
        <div className="cms-panel story-panel" id="profile-builder">
          <div className="cms-sidebar" id="tree">
            {/* new entity */}
            <div className="cms-button-container">
              <Button
                onClick={this.createStory.bind(this)}
                className="cms-add-story-button"
                fontSize="xxs"
                namespace="cms"
                icon="plus"
                iconPosition="right"
                fill
              >
                add story
              </Button>
            </div>

            <SidebarTree
              onNodeClick={this.handleNodeClick.bind(this)}
              onNodeCollapse={this.handleNodeCollapse.bind(this)}
              onNodeExpand={this.handleNodeExpand.bind(this)}
              contents={nodes}
            />

          </div>
          <div className="cms-editor" id="item-editor">
            { currentStoryNode
              ? currentStoryNode.itemType === "story"
                ? <StoryEditor
                  id={currentStoryNode.data.id}
                />
                : currentStoryNode.itemType === "storysection"
                  ? <StorySectionEditor
                    id={currentStoryNode.data.id}
                  />
                  : null
              : <NonIdealState title="No Story Selected" description="Please select a Story from the menu on the left." visual="path-search" />
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
  formatters: PropTypes.object,
  setPath: PropTypes.func
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
