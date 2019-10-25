import React, {Component} from "react";
import {connect} from "react-redux";
import {hot} from "react-hot-loader/root";
import {NonIdealState, Intent, Alert} from "@blueprintjs/core";
import ProfileEditor from "./ProfileEditor";
import SectionEditor from "./SectionEditor";
import PropTypes from "prop-types";
import DimensionBuilder from "../profile/DimensionBuilder";
import Button from "../components/fields/Button";
import CtxMenu from "../components/interface/CtxMenu";
import SidebarTree from "../components/interface/SidebarTree";
import Header from "../components/interface/Header";
import Toolbox from "../components/interface/Toolbox";
import Status from "../components/interface/Status";
import treeify from "../utils/profile/treeify";

import varSwapRecursive from "../utils/varSwapRecursive";

import {getProfiles, newProfile, swapEntity, newSection, deleteSection, deleteProfile, resetPreviews, setVariables} from "../actions/profiles";
import {setStatus} from "../actions/status";
import {getCubeData} from "../actions/cubeData";
import {getFormatters} from "../actions/formatters";

import "./ProfileBuilder.css";

class ProfileBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      nodes: null,
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

  componentDidUpdate(prevProps) {
    // Doing a JSON.Stringify is too expensive here - and we need to ONLY call buildNodes
    // If certain properties of the profiles obj has changed. Use a DIY stringify to detect changes.
    const {nodes} = this.state;
    const {currentPid} = this.props.status;
    const oldTree = prevProps.profiles.reduce((acc, p) => `${acc}-${p.id}-${p.sections.map(s => s.id).join()}`, "");
    const newTree = this.props.profiles.reduce((acc, p) => `${acc}-${p.id}-${p.sections.map(s => s.id).join()}`, "");
    const changedTree = oldTree !== newTree;
    const oldMeta = JSON.stringify(prevProps.profiles.map(p => JSON.stringify(p.meta)));
    const newMeta = JSON.stringify(this.props.profiles.map(p => JSON.stringify(p.meta)));
    const changedMeta = oldMeta !== newMeta;

    // todo listen for query change and formattreevariables (?)
    if (!nodes || changedTree) {
      console.log("Tree Changed: Rebuilding Tree");
      this.buildNodes.bind(this)();
    }
    if (nodes && currentPid && changedMeta) {
      console.log("Meta Changed: Resetting Previews");
      this.props.resetPreviews();
    }

    const changedVariablesOrTitle = prevProps.status.diffCounter !== this.props.status.diffCounter;
    const changedQuery = JSON.stringify(prevProps.status.query) !== JSON.stringify(this.props.status.query);
    if (changedVariablesOrTitle || changedQuery) {
      this.formatTreeVariables.bind(this)();
    }
    
  }

  buildNodes(openNode) {
    const {profiles} = this.props;
    const {localeDefault, pathObj} = this.props.status;
    const nodes = treeify(profiles, localeDefault);
    if (!openNode) {
      const {profile, section} = pathObj;
      let nodeToOpen;
      if (section) {
        nodeToOpen = this.locateNode("section", section, nodes);
        if (!nodeToOpen) nodeToOpen = nodes[0];
        this.setState({nodes}, nodeToOpen ? this.handleNodeClick.bind(this, nodeToOpen) : null);
      }
      else if (profile) {
        let nodeToOpen = this.locateNode("profile", profile, nodes);
        if (!nodeToOpen) nodeToOpen = nodes[0];
        this.setState({nodes}, nodeToOpen ? this.handleNodeClick.bind(this, nodeToOpen) : null);
      }
      else {
        this.setState({nodes});
      }
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

  moveItem(n, dir) {
    this.props.swapEntity(n.itemType, n.data.id, dir);
  }

  /**
   * addItem is only ever used for sections, so lots of section-based assumptions are
   * made here. if this is ever expanded out again to be a generic "item" adder
   * then this will need to be generalized.
   */
  addItem(n) {
    this.props.newSection(n.data.profile_id);
  }

  confirmDelete(n) {
    this.setState({nodeToDelete: n});
  }

  deleteItem(n) {
    if (n.itemType === "section") this.props.deleteSection(n.data.id);
    if (n.itemType === "profile") this.props.deleteProfile(n.data.id);
    this.setState({nodeToDelete: false});
  }

  handleNodeClick(node) {
    node = this.locateNode(node.itemType, node.data.id);
    const {nodes} = this.state;
    const {currentNode, currentPid, previews, pathObj} = this.props.status;
    let parentLength = 0;
    if (node.itemType === "section") parentLength = this.locateNode("profile", node.data.profile_id).childNodes.length;
    if (node.itemType === "profile") parentLength = nodes.length;
    if (!currentNode) {
      node.isSelected = true;
      // If the node has a parent, it's a section. Expand its parent profile so we can see it.
      if (node.parent) node.parent.isExpanded = true;
      node.isExpanded = true;
      node.secondaryLabel = <CtxMenu node={node} parentLength={parentLength} moveItem={this.moveItem.bind(this)} addItem={this.addItem.bind(this)} deleteItem={this.confirmDelete.bind(this)} />;
    }
    else if (node.id !== currentNode.id) {
      // close all profile nodes
      if (node.itemType === "profile") {
        nodes.filter(n => n.id !== node.id).forEach(node => node.isExpanded = false);
      }
      // select & expand the current node
      node.isExpanded = true;
      node.isSelected = true;
      currentNode.isSelected = false;
      node.secondaryLabel = <CtxMenu node={node} parentLength={parentLength} moveItem={this.moveItem.bind(this)} addItem={this.addItem.bind(this)} deleteItem={this.confirmDelete.bind(this)} />;
      currentNode.secondaryLabel = null;
    }
    // This case is needed because, even if the same node is reclicked, its CtxMenu MUST update to reflect the new node (it may no longer be in its old location)
    else if (currentNode && node.id === currentNode.id) {
      node.secondaryLabel = <CtxMenu node={node} parentLength={parentLength} moveItem={this.moveItem.bind(this)} addItem={this.addItem.bind(this)} deleteItem={this.confirmDelete.bind(this)} />;
    }
    const newPathObj = {
      profile: node.itemType === "profile" ? node.data.id : node.parent.data.id,
      section: node.itemType === "section" ? node.data.id : undefined
    };
    // If the pids match, the master profile is the same, so keep the same preview
    if (currentPid === node.masterPid) {
      newPathObj.previews = previews;
      this.props.setStatus({currentNode: node, pathObj: newPathObj});
    }
    // If they don't match, update the currentPid and reset the preview
    else {
      // If previews is a string, we are coming in from the URL permalink. Pass it down to the pathobj.
      if (typeof pathObj.previews === "string") newPathObj.previews = pathObj.previews;
      console.log("setting", node.masterPid);
      this.props.setStatus({currentNode: node, currentPid: node.masterPid, pathObj: newPathObj});
      this.props.resetPreviews();
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
    this.props.newProfile();

    /*
    // wait for the new node to be created
    setTimeout(() => {
      // get the last node
      const {nodes} = this.state;
      const latestNode = nodes[nodes.length - 1];
      // switch to the new node
      this.handleNodeClick(latestNode);
    }, 70);
    */
  }

  /**
   * Given a node type (profile, section) and an id, crawl down the tree and fetch a reference to the Tree node with that id
   */
  locateNode(type, id, pnodes) {
    const nodes = pnodes || this.state.nodes;
    let node = null;
    if (type === "profile") {
      node = nodes.find(p => Number(p.data.id) === Number(id));
    }
    else if (type === "section") {
      nodes.forEach(p => {
        const attempt = p.childNodes.find(t => Number(t.data.id) === Number(id));
        if (attempt) {
          node = attempt;
          node.parent = nodes.find(p => Number(p.data.id) === Number(node.masterPid)); // add parent to node
        }
      });
    }
    return node;
  }

  formatLabel(str) {
    const {selectors} = this.props;
    const {query, localeDefault} = this.props.status;
    const variables = this.props.status.variables[localeDefault];
    const formatters = this.context.formatters[localeDefault];
    const {stripHTML} = formatters;
    str = stripHTML(str);
    str = varSwapRecursive({str, selectors}, formatters, variables, query).str;
    return str;
  }

  /*
   * When the "fetch Variables" function is called (below), it means that something has
   * happened in one of the editors that requires re-running the generators and storing
   * a new set of variables in the hash. When this happens, it is an opportunity to update
   * all the labels in the tree by varSwapping them, allowing them to appear properly
   * in the sidebar.
   */
  formatTreeVariables() {
    const {nodes} = this.state;
    const {currentPid, localeDefault} = this.props.status;
    const p = this.locateProfileNodeByPid(currentPid);
    const thisProfile = this.props.profiles.find(p => p.id === currentPid);
    p.label = p.masterMeta.length > 0 ? p.masterMeta.map(d => d.slug).join("_") : "Add Dimensions";
    p.childNodes = p.childNodes.map(n => {
      const defCon = thisProfile.sections.find(s => s.id === n.data.id).content.find(c => c.locale === localeDefault);
      const title = defCon && defCon.title ? defCon.title : n.data.slug;
      n.label = this.formatLabel.bind(this)(title);
      return n;
    });
    this.setState({nodes});
  }

  render() {

    const {nodes, nodeToDelete, toolboxVisible} = this.state;
    const {currentNode, currentPid, previews, gensLoaded, gensTotal, genLang} = this.props.status;

    if (!nodes) return null;

    const editorTypes = {profile: ProfileEditor, section: SectionEditor};
    const Editor = currentNode ? editorTypes[currentNode.itemType] : null;

    // get current node order; used for showing hero section in section layout list
    let currNodeOrder;
    if (currentNode && currentNode.data) currNodeOrder = currentNode.data.ordering;

    return (
      <React.Fragment>
        <div className="cms-panel profile-panel" id="profile-builder">
          <div className="cms-sidebar" id="tree">
            {/* new entity */}
            <div className="cms-button-container">
              <Button
                onClick={this.createProfile.bind(this)}
                namespace="cms"
                className="cms-add-profile-button"
                fontSize="xxs"
                icon="plus"
                iconPosition="right"
                fill
              >
                add profile
              </Button>
            </div>

            <SidebarTree
              onNodeClick={this.handleNodeClick.bind(this)}
              onNodeCollapse={this.handleNodeCollapse.bind(this)}
              onNodeExpand={this.handleNodeExpand.bind(this)}
              contents={nodes}
            />
          </div>

          <div className={`cms-editor${toolboxVisible ? " cms-multicolumn-editor" : ""}`} id="item-editor">
            { currentNode
              ? <Editor
                id={currentNode.data.id}
                order={currNodeOrder}
              >
                <Header
                  title={currentNode.label}
                  parentTitle={currentNode.itemType !== "profile" &&
                    currentNode.parent.label
                  }
                  dimensions={previews}
                  slug={currentNode.data.slug}
                />

                <DimensionBuilder />
              </Editor>
              : <NonIdealState title="No Profile Selected" description="Please select a Profile from the menu on the left." visual="path-search" />
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
  newProfile: () => dispatch(newProfile()),
  swapEntity: (type, id, dir) => dispatch(swapEntity(type, id, dir)),
  newSection: pid => dispatch(newSection(pid)),
  deleteProfile: id => dispatch(deleteProfile(id)),
  deleteSection: id => dispatch(deleteSection(id)),
  resetPreviews: () => dispatch(resetPreviews()),
  setStatus: status => dispatch(setStatus(status)),
  getCubeData: () => dispatch(getCubeData()),
  getFormatters: () => dispatch(getFormatters()),
  setVariables: newVariables => dispatch(setVariables(newVariables))
});

export default connect(mapStateToProps, mapDispatchToProps)(hot(ProfileBuilder));
