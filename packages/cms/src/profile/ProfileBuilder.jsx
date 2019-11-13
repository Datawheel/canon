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

import {getProfiles, newProfile, swapEntity, newEntity, deleteEntity, deleteProfile, setVariables} from "../actions/profiles";
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

  moveItem(n) {
    this.props.swapEntity(n.itemType, n.data.id);
  }

  /**
   * addItem is only ever used for sections, so lots of section-based assumptions are
   * made here. if this is ever expanded out again to be a generic "item" adder
   * then this will need to be generalized.
   */
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

  locateProfileNodeByPid(pid) {
    return this.state.nodes.find(p => p.data.id === pid);
  }

  createProfile() {
    this.props.newProfile();
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
          node.parent = nodes.find(p => Number(p.data.id) === Number(node.data.profile_id)); // add parent to node
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

  formatTreeVariables() {
    const {nodes} = this.state;
    const {currentPid, localeDefault} = this.props.status;
    const p = this.locateProfileNodeByPid(currentPid);
    const thisProfile = this.props.profiles.find(p => p.id === currentPid);
    p.label = thisProfile.meta.length > 0 ? thisProfile.meta.map(d => d.slug).join("_") : "Add Dimensions";
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
    const {currentPid, gensLoaded, gensTotal, genLang, pathObj} = this.props.status;

    if (!nodes) return null;

    const editorTypes = {profile: ProfileEditor, section: SectionEditor};
    const Editor = pathObj.section ? editorTypes.section : pathObj.profile ? editorTypes.profile : null;
    const id = pathObj.section ? pathObj.section : pathObj.profile ? pathObj.profile : null;

    return (
      <React.Fragment>
        <div className="cms-panel profile-panel" id="profile-builder">
          <div className={`cms-editor${toolboxVisible ? " cms-multicolumn-editor" : ""}`} id="item-editor">
            { Editor
              ? <Editor id={id}>
                {
                
                /*
                <Header
                  title={currentNode.label}
                  parentTitle={currentNode.itemType !== "profile" &&
                    currentNode.parent.label
                  }
                  dimensions={previews}
                  slug={currentNode.data.slug}
                />
                */
                }

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
