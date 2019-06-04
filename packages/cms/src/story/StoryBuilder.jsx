import axios from "axios";
import React, {Component} from "react";
import {NonIdealState, Tree, Alert, Intent} from "@blueprintjs/core";
import PropTypes from "prop-types";
import CtxMenu from "../components/CtxMenu";
import Button from "../components/Button";
import StoryEditor from "./StoryEditor";
import StoryTopicEditor from "./StoryTopicEditor";

const topicIcons = {
  Card: "square",
  Column: "list",
  Tabs: "folder-close",
  TextViz: "list-detail-view"
};

class StoryBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      nodes: null,
      stories: null,
      nodeToDelete: false
    };
  }

  componentDidMount() {
    axios.get("/api/cms/storytree").then(resp => {
      const stories = resp.data;
      this.setState({stories}, this.buildNodes.bind(this));
    });
  }

  /**
   * Decode HTML elements such as &amp;. Taken from:
   * https://stackoverflow.com/questions/3700326/decode-amp-back-to-in-javascript
   */
  decode(str) {
    const elem = document.createElement("textarea");
    elem.innerHTML = str;
    return elem.value;
  }

  buildNodes(openNode) {
    const {stories} = this.state;
    const {localeDefault} = this.props;
    const {stripHTML} = this.context.formatters[localeDefault];
    const nodes = stories.map(s => {
      const defCon = s.content.find(c => c.lang === localeDefault);
      const title = defCon && defCon.title ? defCon.title : s.slug;
      return {
        id: `story${s.id}`,
        hasCaret: true,
        label: this.decode(stripHTML(title)),
        itemType: "story",
        data: s,
        childNodes: s.storytopics.map(t => {
          const defCon = t.content.find(c => c.lang === localeDefault);
          const title = defCon && defCon.title ? defCon.title : t.slug;
          return {
            id: `storytopic${t.id}`,
            hasCaret: false,
            label: this.decode(stripHTML(title)),
            iconName: topicIcons[t.type] || "help",
            itemType: "storytopic",
            data: t
          };
        })
      };
    });
    if (!openNode) {
      this.setState({nodes});
    }
    else {
      this.setState({nodes}, this.handleNodeClick.bind(this, nodes[0]));
    }
  }

  saveNode(node) {
    const payload = {id: node.data.id, ordering: node.data.ordering};
    axios.post(`/api/cms/${node.itemType}/update`, payload).then(resp => {
      resp.status === 200 ? console.log("saved") : console.log("error");
    });
  }

  moveItem(n, dir) {
    const {nodes} = this.state;
    const sorter = (a, b) => a.data.ordering - b.data.ordering;
    n = this.locateNode(n.itemType, n.data.id);
    let parentArray;
    if (n.itemType === "storytopic") parentArray = this.locateNode("story", n.data.story_id).childNodes;
    if (n.itemType === "story") parentArray = nodes;
    if (dir === "up") {
      const old = parentArray.find(node => node.data.ordering === n.data.ordering - 1);
      old.data.ordering++;
      n.data.ordering--;
      this.saveNode(old);
      this.saveNode(n);
    }
    if (dir === "down") {
      const old = parentArray.find(node => node.data.ordering === n.data.ordering + 1);
      old.data.ordering--;
      n.data.ordering++;
      this.saveNode(old);
      this.saveNode(n);
    }
    parentArray.sort(sorter);
    this.setState({nodes});
  }

  addItem(n, dir) {
    const {nodes} = this.state;
    const {localeDefault} = this.props;
    const {stripHTML} = this.context.formatters[localeDefault];
    n = this.locateNode(n.itemType, n.data.id);
    let parentArray;
    if (n.itemType === "storytopic") {
      parentArray = this.locateNode("story", n.data.story_id).childNodes;
    }
    else if (n.itemType === "story") {
      parentArray = nodes;
    }
    let loc = n.data.ordering;
    if (dir === "above") {
      for (const node of parentArray) {
        if (node.data.ordering >= n.data.ordering) {
          node.data.ordering++;
          this.saveNode(node);
        }
      }
    }
    if (dir === "below") {
      loc++;
      for (const node of parentArray) {
        if (node.data.ordering >= n.data.ordering + 1) {
          node.data.ordering++;
          this.saveNode(node);
        }
      }
    }

    const objStoryTopic = {
      hasCaret: false,
      itemType: "storytopic",
      data: {}
    };
    objStoryTopic.data.story_id = n.data.story_id;
    objStoryTopic.data.ordering = loc;

    const objStory = {
      hasCaret: true,
      itemType: "story",
      data: {}
    };
    objStory.data.ordering = loc;

    let obj = null;

    if (n.itemType === "storytopic") {
      obj = objStoryTopic;
    }
    if (n.itemType === "story") {
      obj = objStory;
      objStoryTopic.data.ordering = 0;
      obj.childNodes = [objStoryTopic];
    }

    if (obj) {

      const storyPath = "/api/cms/story/new";
      const storyTopicPath = "/api/cms/storytopic/new";

      if (n.itemType === "storytopic") {
        axios.post(storyTopicPath, obj.data).then(storytopic => {
          if (storytopic.status === 200) {
            obj.id = `storytopic${storytopic.data.id}`;
            obj.data = storytopic.data;
            const defCon = storytopic.data.content.find(c => c.lang === localeDefault);
            const title = defCon && defCon.title ? defCon.title : storytopic.data.slug;
            obj.label = this.decode(stripHTML(title));
            const parent = this.locateNode("story", obj.data.story_id);
            parent.childNodes.push(obj);
            parent.childNodes.sort((a, b) => a.data.ordering - b.data.ordering);
            this.setState({nodes}, this.handleNodeClick.bind(this, obj));
          }
          else {
            console.log("storytopic error");
          }
        });
      }
      else if (n.itemType === "story") {
        axios.post(storyPath, obj.data).then(story => {
          obj.id = `story${story.data.id}`;
          obj.data = story.data;
          const defCon = story.data.content.find(c => c.lang === localeDefault);
          const title = defCon && defCon.title ? defCon.title : story.data.slug;
          obj.label = this.decode(stripHTML(title));
          objStoryTopic.data.story_id = story.data.id;
          axios.post(storyTopicPath, objStoryTopic.data).then(storyTopic => {
            if (storyTopic.status === 200) {
              objStoryTopic.id = `storytopic${storyTopic.data.id}`;
              objStoryTopic.data = storyTopic.data;
              const defCon = storyTopic.data.content.find(c => c.lang === localeDefault);
              const title = defCon && defCon.title ? defCon.title : storyTopic.data.slug;
              objStoryTopic.label = this.decode(stripHTML(title));
              nodes.push(obj);
              nodes.sort((a, b) => a.data.ordering - b.data.ordering);
              this.setState({nodes}, this.handleNodeClick.bind(this, obj));
            }
            else {
              console.log("story error");
            }
          });
        });
      }
    }
  }

  confirmDelete(n) {
    this.setState({nodeToDelete: n});
  }

  deleteItem(n) {
    const {nodes} = this.state;
    const {localeDefault} = this.props;
    const {stripHTML} = this.context.formatters[localeDefault];
    n = this.locateNode(n.itemType, n.data.id);
    const nodeToDelete = false;
    // todo: instead of the piecemeal refreshes being done for each of these tiers - is it sufficient to run buildNodes again?
    if (n.itemType === "storytopic") {
      const parent = this.locateNode("story", n.data.story_id);
      axios.delete("/api/cms/storytopic/delete", {params: {id: n.data.id}}).then(resp => {
        const storytopics = resp.data.map(storyTopicData => {
          const defCon = storyTopicData.content.find(c => c.lang === localeDefault);
          const title = defCon && defCon.title ? defCon.title : storyTopicData.slug;
          return {
            id: `storytopic${storyTopicData.id}`,
            hasCaret: false,
            iconName: topicIcons[storyTopicData.type] || "help",
            label: this.decode(stripHTML(title)),
            itemType: "storytopic",
            data: storyTopicData
          };
        });
        parent.childNodes = storytopics;
        this.setState({nodes, nodeToDelete}, this.handleNodeClick.bind(this, parent.childNodes[0]));
      });
    }
    else if (n.itemType === "story") {
      axios.delete("/api/cms/story/delete", {params: {id: n.data.id}}).then(resp => {
        const stories = resp.data;
        this.setState({stories, nodeToDelete}, this.buildNodes.bind(this, true));
      });
    }
  }

  handleNodeClick(node) {
    node = this.locateNode(node.itemType, node.data.id);
    const {nodes, currentNode} = this.state;
    let parentLength = 0;
    if (node.itemType === "storytopic") parentLength = this.locateNode("story", node.data.story_id).childNodes.length;
    if (node.itemType === "story") parentLength = nodes.length;
    if (!currentNode) {
      node.isSelected = true;
      node.secondaryLabel = <CtxMenu node={node} parentLength={parentLength} moveItem={this.moveItem.bind(this)} addItem={this.addItem.bind(this)} deleteItem={this.confirmDelete.bind(this)} />;
    }
    else if (node.id !== currentNode.id) {
      node.isSelected = true;
      currentNode.isSelected = false;
      node.secondaryLabel = <CtxMenu node={node} parentLength={parentLength} moveItem={this.moveItem.bind(this)} addItem={this.addItem.bind(this)} deleteItem={this.confirmDelete.bind(this)} />;
      currentNode.secondaryLabel = null;
    }
    // This case is needed becuase, even if the same node is reclicked, its CtxMenu MUST update to reflect the new node (it may no longer be in its old location)
    else if (currentNode && node.id === currentNode.id) {
      node.secondaryLabel = <CtxMenu node={node} parentLength={parentLength} moveItem={this.moveItem.bind(this)} addItem={this.addItem.bind(this)} deleteItem={this.confirmDelete.bind(this)} />;
    }
    if (this.props.setPath) this.props.setPath(node);
    this.setState({currentNode: node});
  }

  addFirst() {
    const storyStub = {ordering: 0};
    const storytopicStub = {ordering: 0};

    axios.post("/api/cms/story/new", storyStub).then(s => {
      storytopicStub.story_id = s.data.id;
      axios.post("/api/cms/storytopic/new", storytopicStub).then(t => {
        if (t.status === 200) {
          axios.get("/api/cms/storytree").then(resp => {
            const stories = resp.data;
            this.setState({stories}, this.buildNodes.bind(this));
          });
        }
      });
    });

    // NOTE: ordering seems reversed compared to profiles, commenting this out for now
    // // wait for the new node to be created
    // setTimeout(() => {
    //   // get the last node
    //   const {nodes} = this.state;
    //   const latestNode = nodes[nodes.length - 1];
    //   // switch to the new node
    //   this.handleNodeClick(latestNode);
    // }, 70);
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
   * Given a node type (story, storytopic) and an id, crawl down the tree and fetch a reference to the Tree node with that id
   */
  locateNode(type, id) {
    const {nodes} = this.state;
    let node = null;
    if (type === "story") {
      node = nodes.find(s => s.data.id === id);
    }
    else if (type === "storytopic") {
      nodes.forEach(s => {
        const attempt = s.childNodes.find(t => t.data.id === id);
        if (attempt) node = attempt;
      });
    }
    return node;
  }

  /**
   * If a save occurred in one of the editors, the user may have changed the title. This callback is responsible for
   * updating the tree labels accordingly.
   */
  reportSave(type, id, newValue) {
    const {nodes} = this.state;
    const {localeDefault} = this.props;
    const {stripHTML} = this.context.formatters[localeDefault];
    const node = this.locateNode.bind(this)(type, id);
    // Update the label based on the new value. If this is a section or a topic, this is the only thing needed
    if (node) {
      const defCon = node.data.content.find(c => c.lang === localeDefault);
      if (defCon) defCon.title = newValue;
      node.label = this.decode(stripHTML(newValue));
    }
    this.setState({nodes});
  }


  render() {

    const {nodes, currentNode, nodeToDelete} = this.state;
    const {locale, localeDefault} = this.props;

    if (!nodes) return false;

    return (
      <div className="cms-panel story-panel" id="profile-builder">
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

        <div className="cms-sidebar" id="tree">

          {/* new entity */}
          <Button onClick={this.addFirst.bind(this)} icon="plus" iconPosition="right" ghost>
            Add story
          </Button>

          <Tree
            onNodeClick={this.handleNodeClick.bind(this)}
            onNodeCollapse={this.handleNodeCollapse.bind(this)}
            onNodeExpand={this.handleNodeExpand.bind(this)}
            contents={nodes}
          />

        </div>
        <div className="cms-editor" id="item-editor">
          { currentNode
            ? currentNode.itemType === "story"
              ? <StoryEditor
                id={currentNode.data.id}
                locale={locale}
                localeDefault={localeDefault}
                reportSave={this.reportSave.bind(this)}
              />
              : currentNode.itemType === "storytopic"
                ? <StoryTopicEditor
                  id={currentNode.data.id}
                  locale={locale}
                  localeDefault={localeDefault}
                  reportSave={this.reportSave.bind(this)}
                />
                : null
            : <NonIdealState title="No Story Selected" description="Please select a Story from the menu on the left." visual="path-search" />
          }
        </div>

      </div>
    );
  }
}

StoryBuilder.contextTypes = {
  formatters: PropTypes.object
};

export default StoryBuilder;
