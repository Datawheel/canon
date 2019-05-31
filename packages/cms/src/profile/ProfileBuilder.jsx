import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {NonIdealState, Tree, Intent, Alert} from "@blueprintjs/core";
import ProfileEditor from "./ProfileEditor";
import TopicEditor from "./TopicEditor";
import PropTypes from "prop-types";
import DimensionBuilder from "../profile/DimensionBuilder";
import CtxMenu from "../components/CtxMenu";

import varSwap from "../utils/varSwap";

import deepClone from "../utils/deepClone.js";

import "./ProfileBuilder.css";

const topicIcons = {
  Card: "square",
  Column: "list",
  Tabs: "folder-close",
  TextViz: "list-detail-view"
};

class ProfileBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      nodes: null,
      profiles: null,
      currentNode: null,
      currentPid: null,
      variablesHash: {},
      previews: [],
      cubeData: {}
    };
  }

  componentDidMount() {
    const treeGet = axios.get("/api/cms/tree");
    const cubeGet = axios.get("/api/cubeData");
    Promise.all([treeGet, cubeGet]).then(resp => {
      const profiles = resp[0].data;
      const cubeData = resp[1].data;
      this.setState({profiles, cubeData}, this.buildNodes.bind(this));
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.locale !== this.props.locale) {
      const {currentPid} = this.state;
      if (currentPid) this.fetchVariables.bind(this)(true);
    }
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
    const {profiles} = this.state;
    const {localeDefault} = this.props;
    const {stripHTML} = this.context.formatters[localeDefault];
    // const {profileSlug, topicSlug} = this.props.pathObj;
    const nodes = profiles.map(p => ({
      id: `profile${p.id}`,
      hasCaret: true,
      label: p.meta.length > 0 ? p.meta.map(d => d.slug).join("_") : "Add Dimensions",
      itemType: "profile",
      masterPid: p.id,
      masterMeta: p.meta,
      data: p,
      childNodes: p.topics.map(t => {
        const defCon = t.content.find(c => c.lang === localeDefault);
        const title = defCon && defCon.title ? defCon.title : t.slug;
        return {
          id: `topic${t.id}`,
          hasCaret: false,
          label: this.decode(stripHTML(title)),
          itemType: "topic",
          masterPid: p.id,
          masterMeta: p.meta,
          data: t
        };
      })
    }));
    if (!openNode) {
      this.setState({nodes});
    }
    else {
      if (typeof openNode !== "boolean") {
        const nodeToOpen = this.locateProfileNodeByPid(openNode);
        this.setState({nodes}, this.handleNodeClick.bind(this, nodeToOpen));
      }
      else {
        const nodeToOpen = nodes[0];
        this.setState({nodes}, this.handleNodeClick.bind(this, nodeToOpen));
      }

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
    if (n.itemType === "topic") parentArray = this.locateNode("profile", n.data.profile_id).childNodes;
    if (n.itemType === "profile") parentArray = nodes;
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

  /**
   * addItem is only ever used for topics, so lots of topic-based assumptions are
   * made here. if this is ever expanded out again to be a generic "item" adder
   * then this will need to be generalized.
   */
  addItem(n, dir) {
    const {nodes} = this.state;
    const {variablesHash, currentPid} = this.state;
    const {localeDefault} = this.props;
    const formatters = this.context.formatters[localeDefault];
    const {stripHTML} = formatters;
    const variables = variablesHash[currentPid] && variablesHash[currentPid][localeDefault] ? deepClone(variablesHash[currentPid][localeDefault]) : null;
    n = this.locateNode(n.itemType, n.data.id);

    const parent = this.locateNode("profile", n.data.profile_id);
    const parentArray = parent.childNodes;

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

    // New Topics need to inherit their masterDimension from their parent.

    const obj = {
      hasCaret: false,
      itemType: "topic",
      data: {}
    };
    obj.data.profile_id = n.data.profile_id;
    obj.data.ordering = loc;
    obj.masterPid = parent.masterPid;
    obj.masterMeta = parent.masterMeta;

    const topicPath = "/api/cms/topic/new";
    axios.post(topicPath, obj.data).then(topic => {
      if (topic.status === 200) {
        obj.id = `topic${topic.data.id}`;
        obj.data = topic.data;
        const defCon = topic.data.content.find(c => c.lang === localeDefault);
        const title = defCon && defCon.title ? defCon.title : topic.slug;
        obj.label = varSwap(this.decode(stripHTML(title)), formatters, variables);
        const parent = this.locateNode("profile", obj.data.profile_id);
        parent.childNodes.push(obj);
        parent.childNodes.sort((a, b) => a.data.ordering - b.data.ordering);
        this.setState({nodes}, this.handleNodeClick.bind(this, obj));
      }
      else {
        console.log("topic error");
      }
    });
  }

  confirmDelete(n) {
    this.setState({nodeToDelete: n});
  }

  deleteItem(n) {
    const {nodes} = this.state;
    const {localeDefault} = this.props;
    const {stripHTML} = this.context.formatters[localeDefault];
    // If this method is running, then the user has clicked "Confirm" in the Deletion Alert. Setting the state of
    // nodeToDelete back to false will close the Alert popover.
    const nodeToDelete = false;
    n = this.locateNode(n.itemType, n.data.id);
    // todo: instead of the piecemeal refreshes being done for each of these tiers - is it sufficient to run buildNodes again?
    if (n.itemType === "topic") {
      const parent = this.locateNode("profile", n.data.profile_id);
      axios.delete("/api/cms/topic/delete", {params: {id: n.data.id}}).then(resp => {
        const topics = resp.data.map(topicData => {
          const defCon = topicData.content.find(c => c.lang === localeDefault);
          const title = defCon && defCon.title ? defCon.title : topicData.slug;
          return {
            id: `topic${topicData.id}`,
            hasCaret: false,
            iconName: topicIcons[topicData.type] || "help",
            label: this.decode(stripHTML(title)),
            itemType: "topic",
            masterPid: parent.masterPid,
            masterMeta: parent.masterMeta,
            data: topicData
          };
        });
        parent.childNodes = topics;
        this.setState({nodes, nodeToDelete}, this.handleNodeClick.bind(this, parent.childNodes[0]));
      });
    }
    else if (n.itemType === "profile") {
      axios.delete("/api/cms/profile/delete", {params: {id: n.data.id}}).then(resp => {
        const profiles = resp.data;
        this.setState({profiles, nodeToDelete}, this.buildNodes.bind(this, true));
      });
    }
  }

  handleNodeClick(node) {
    node = this.locateNode(node.itemType, node.data.id);
    const {nodes, currentNode} = this.state;
    let parentLength = 0;
    if (node.itemType === "topic") parentLength = this.locateNode("profile", node.data.profile_id).childNodes.length;
    if (node.itemType === "profile") parentLength = nodes.length;
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
    // This case is needed because, even if the same node is reclicked, its CtxMenu MUST update to reflect the new node (it may no longer be in its old location)
    else if (currentNode && node.id === currentNode.id) {
      node.secondaryLabel = <CtxMenu node={node} parentLength={parentLength} moveItem={this.moveItem.bind(this)} addItem={this.addItem.bind(this)} deleteItem={this.confirmDelete.bind(this)} />;
    }
    if (this.props.setPath) this.props.setPath(node);
    // If the pids match, the master profile is the same, so keep the same preview
    if (this.state.currentPid === node.masterPid) {
      this.setState({currentNode: node});
    }
    // If they don't match, update the currentPid and reset the preview
    else {
      // An empty search string will automatically provide the highest z-index results.
      // Use this to auto-populate the preview when the user changes profiles.
      const requests = node.masterMeta.map(meta => {
        const levels = meta.levels ? meta.levels.join() : false;
        const levelString = levels ? `&levels=${levels}` : "";
        const url = `/api/search?q=&dimension=${meta.dimension}${levelString}`;
        return axios.get(url);
      });
      const previews = [];
      Promise.all(requests).then(resps => {
        resps.forEach((resp, i) => {
          previews.push({
            slug: node.masterMeta[i].slug,
            id: resp && resp.data && resp.data.results && resp.data.results[0] ? resp.data.results[0].id : ""
          });
        });
        this.setState({currentNode: node, currentPid: node.masterPid, previews});
      });
    }
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
   *
   */
  locateProfileNodeByPid(pid) {
    return this.state.nodes.find(p => p.data.id === pid);
  }

  createProfile() {
    const profileData = {
      ordering: this.state.nodes.length
    };
    axios.post("/api/cms/profile/newScaffold", profileData).then(resp => {
      const profiles = resp.data;
      this.setState({profiles}, this.buildNodes.bind(this));
    });

    // wait for the new node to be created
    setTimeout(() => {
      const {nodes} = this.state;
      const latestNode = nodes[nodes.length - 1];
      // switch to the new node
      this.handleNodeClick(latestNode);
    }, 60);
  }

  /**
   * Given a node type (profile, topic) and an id, crawl down the tree and fetch a reference to the Tree node with that id
   */
  locateNode(type, id) {
    const {nodes} = this.state;
    let node = null;
    if (type === "profile") {
      node = nodes.find(p => p.data.id === id);
    }
    else if (type === "topic") {
      nodes.forEach(p => {
        const attempt = p.childNodes.find(t => t.data.id === id);
        if (attempt) node = attempt;
      });
    }
    return node;
  }

  /**
   * If a save occurred in the TopicEditor, the user may have changed the slug/title. This callback is responsible for
   * updating the tree labels accordingly.
   */
  reportSave(id, newValue) {
    const {nodes} = this.state;
    const {variablesHash, currentPid} = this.state;
    const {localeDefault} = this.props;
    const formatters = this.context.formatters[localeDefault];
    const {stripHTML} = formatters;
    const variables = variablesHash[currentPid] && variablesHash[currentPid][localeDefault] ? deepClone(variablesHash[currentPid][localeDefault]) : null;
    const node = this.locateNode.bind(this)("topic", id);
    // Update the label based on the new value.
    if (node) {
      const defCon = node.data.content.find(c => c.lang === localeDefault);
      if (defCon) defCon.title = newValue;
      // todo: determine if this could be merged with formatTreeVariables
      node.label = varSwap(this.decode(stripHTML(newValue)), formatters, variables);
    }
    this.setState({nodes});
  }

  onAddDimension(data) {
    const {currentPid, currentNode} = this.state;
    const ordering = currentNode.masterMeta.length;
    const payload = Object.assign({}, data, {profile_id: currentPid, ordering});
    axios.post("/api/cms/profile/addDimension", payload).then(resp => {
      const profiles = resp.data;
      const thisProfile = profiles.find(p => p.id === currentPid);
      const masterMeta = thisProfile.meta;
      const requests = masterMeta.map(meta => {
        const levels = meta.levels ? meta.levels.join() : false;
        const levelString = levels ? `&levels=${levels}` : "";
        const url = `/api/search?q=&dimension=${meta.dimension}${levelString}`;
        return axios.get(url);
      });
      const previews = [];
      Promise.all(requests).then(resps => {
        resps.forEach((resp, i) => {
          previews.push({
            slug: masterMeta[i].slug,
            id: resp && resp.data && resp.data.results && resp.data.results[0] ? resp.data.results[0].id : ""
          });
        });
        this.setState({profiles, previews}, this.buildNodes.bind(this, currentPid));
      });
    });
  }

  /*
   * Callback for Preview.jsx, pass down new preview id to all Editors
   */
  onSelectPreview(slug, id) {
    const previews = this.state.previews.map(p => {
      const newId = p.slug === slug ? id : p.id;
      return {
        id: newId,
        slug: p.slug
      };
    });
    this.setState({previews});
  }

  /*
   * When the "fetch Variables" function is called (below), it means that something has
   * happened in one of the editors that requires re-running the generators and storing
   * a new set of variables in the hash. When this happens, it is an opportunity to update
   * all the labels in the tree by varSwapping them, allowing them to appear properly
   * in the sidebar.
   */
  formatTreeVariables() {
    const {variablesHash, currentPid, nodes} = this.state;
    const {localeDefault} = this.props;
    const formatters = this.context.formatters[localeDefault];
    const {stripHTML} = formatters;
    const variables = variablesHash[currentPid] && variablesHash[currentPid][localeDefault] ? deepClone(variablesHash[currentPid][localeDefault]) : null;
    const p = this.locateProfileNodeByPid(currentPid);
    p.label = p.masterMeta.length > 0 ? p.masterMeta.map(d => d.slug).join("_") : "Add Dimensions";
    // p.label = varSwap(p.data.slug, formatters, variables);
    p.childNodes = p.childNodes.map(t => {
      const defCon = t.data.content.find(c => c.lang === localeDefault);
      const title = defCon && defCon.title ? defCon.title : t.data.slug;
      t.label = varSwap(this.decode(stripHTML(title)), formatters, variables);
      return t;
    });
    this.setState({nodes});
  }

  /**
   * Certain events in the Editors, such as saving a generator, can change the resulting
   * variables object. In order to ensure that this new variables object is passed down to
   * all the editors, each editor has a callback that accesses this function. We store the
   * variables object in a hash that is keyed by the profile id, so we don't re-run the get if
   * the variables are already there. However, we provide a "force" option, which editors
   * can use to say "trust me, I've changed something, you need to re-do the variables get"
   */
  fetchVariables(force, callback) {
    const {variablesHash, currentPid, previews} = this.state;
    const {locale, localeDefault} = this.props;
    const maybeCallback = () => {
      if (callback) callback();
      this.formatTreeVariables.bind(this)();
    };
    if (force || !variablesHash[currentPid] || variablesHash[currentPid] && locale && !variablesHash[currentPid][locale]) {
      let url = `/api/variables/${currentPid}/?locale=${localeDefault}`;
      previews.forEach((p, i) => {
        url += `&slug${i + 1}=${p.slug}&id${i + 1}=${p.id}`;
      });
      axios.get(url).then(def => {
        const defObj = {[localeDefault]: def.data};
        if (!variablesHash[currentPid]) {
          variablesHash[currentPid] = defObj;
        }
        else {
          variablesHash[currentPid] = Object.assign(variablesHash[currentPid], defObj);
        }
        if (locale) {
          let lurl = `/api/variables/${currentPid}/?locale=${locale}`;
          previews.forEach((p, i) => {
            lurl += `&slug${i + 1}=${p.slug}&id${i + 1}=${p.id}`;
          });
          axios.get(lurl).then(loc => {
            const locObj = {[locale]: loc.data};
            variablesHash[currentPid] = Object.assign(variablesHash[currentPid], locObj);
            this.setState({variablesHash}, maybeCallback);
          });
        }
        else {
          this.setState({variablesHash}, maybeCallback);
        }
      });
    }
    else {
      this.setState({variablesHash}, maybeCallback);
    }
  }

  render() {

    const {nodes, currentNode, variablesHash, currentPid, previews, cubeData, nodeToDelete} = this.state;
    const {locale, localeDefault} = this.props;

    if (!nodes) return null;

    const variables = variablesHash[currentPid] ? deepClone(variablesHash[currentPid]) : null;

    const editorTypes = {profile: ProfileEditor, topic: TopicEditor};
    const Editor = currentNode ? editorTypes[currentNode.itemType] : null;

    return (

      <div className="cms-panel profile-panel" id="profile-builder">
        <div className="cms-sidebar" id="tree">

          {/* new entity */}
          <button className="cms-button"
            onClick={this.createProfile.bind(this)}>
              Add profile <span className="bp3-icon bp3-icon-plus" />
          </button>

          <Tree
            onNodeClick={this.handleNodeClick.bind(this)}
            onNodeCollapse={this.handleNodeCollapse.bind(this)}
            onNodeExpand={this.handleNodeExpand.bind(this)}
            contents={nodes}
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
        <div className="cms-editor" id="item-editor">
          { currentNode
            ? <Editor
              id={currentNode.data.id}
              locale={locale}
              localeDefault={localeDefault}
              masterSlug={currentNode.masterSlug}
              previews={previews}
              fetchVariables={this.fetchVariables.bind(this)}
              variables={variables}
              reportSave={this.reportSave.bind(this)}
            >
              {currentNode &&
                <DimensionBuilder
                  cubeData={cubeData}
                  meta={currentNode.masterMeta}
                  previews={previews}
                  onSelectPreview={this.onSelectPreview.bind(this)}
                  onAddDimension={this.onAddDimension.bind(this)}
                />
              }
            </Editor>
            : <NonIdealState title="No Profile Selected" description="Please select a Profile from the menu on the left." visual="path-search" />
          }
        </div>

      </div>
    );
  }
}

ProfileBuilder.contextTypes = {
  formatters: PropTypes.object
};

export default connect(state => ({env: state.env}))(ProfileBuilder);
