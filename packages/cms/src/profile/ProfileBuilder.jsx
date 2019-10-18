import axios from "axios";
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

import {getProfiles, newProfile, swapEntity, newSection, deleteSection} from "../actions/profiles";
import {setStatus} from "../actions/status";
import {getCubeData} from "../actions/cubeData";

import "./ProfileBuilder.css";

class ProfileBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      nodes: null,
      selectors: [],
      query: {},
      toolboxVisible: true
    };
  }

  getChildContext() {
    return {
      onSetVariables: this.onSetVariables.bind(this),
      onSelectPreview: this.onSelectPreview.bind(this),
      onDimensionModify: this.onDimensionModify.bind(this)
    };
  }

  componentDidMount() {
    this.props.getProfiles();
    this.props.getCubeData();
  }

  componentDidUpdate(prevProps) {
    const oldTree = prevProps.profiles.reduce((acc, p) => `${acc}-${p.id}-${p.sections.map(s => s.id).join()}`, "");    
    const newTree = this.props.profiles.reduce((acc, p) => `${acc}-${p.id}-${p.sections.map(s => s.id).join()}`, ""); 
    if (oldTree !== newTree) {
      console.log("rebuilding");
      this.buildNodes.bind(this)();
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
    const {localeDefault, profiles} = this.props;
    const nodes = treeify(profiles, localeDefault);
    if (!openNode) {
      const {profile, section} = this.props.pathObj;
      if (section) {
        let nodeToOpen = this.locateNode("section", section, nodes);
        if (!nodeToOpen) nodeToOpen = nodes[0];
        this.setState({nodes}, this.handleNodeClick.bind(this, nodeToOpen));
      }
      else if (profile) {
        const nodeToOpen = this.locateNode("profile", profile, nodes);
        if (!nodeToOpen) nodeToOpen = nodes[0];
        this.setState({nodes}, this.handleNodeClick.bind(this, nodeToOpen));
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
    //if (n.itemType === "profile") this.props.deleteProfile(n.data.id);
    this.setState({nodeToDelete: false});
  }

  handleNodeClick(node) {
    node = this.locateNode(node.itemType, node.data.id);
    const {nodes} = this.state;
    const {currentNode, previews} = this.props.status;
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
    const pathObj = {
      profile: node.itemType === "profile" ? node.data.id : node.parent.data.id,
      section: node.itemType === "section" ? node.data.id : undefined
    };
    // If the pids match, the master profile is the same, so keep the same preview
    if (this.state.currentPid === node.masterPid) {
      pathObj.previews = previews;
      this.context.setPath(pathObj);
      this.props.setStatus({currentNode: node});
    }
    // If they don't match, update the currentPid and reset the preview
    else {
      // An empty search string will automatically provide the highest z-index results.
      // Use this to auto-populate the preview when the user changes profiles.
      const requests = node.masterMeta.map((meta, i) => {
        const levels = meta.levels ? meta.levels.join() : false;
        const levelString = levels ? `&levels=${levels}` : "";
        let url = `/api/search?q=&dimension=${meta.dimension}${levelString}&limit=1`;
        const ps = this.props.pathObj.previews;
        // If previews is of type string, then it came from the URL permalink. Override
        // The search to manually choose the exact id for each dimension.
        if (typeof ps === "string") {
          const ids = ps.split(",");
          const id = ids[i];
          if (id) url += `&id=${id}`;
        }
        return axios.get(url);
      });
      const previews = [];
      Promise.all(requests).then(resps => {
        resps.forEach((resp, i) => {
          previews.push({
            slug: node.masterMeta[i].slug,
            id: resp && resp.data && resp.data.results && resp.data.results[0] ? resp.data.results[0].id : "",
            name: resp && resp.data && resp.data.results && resp.data.results[0] ? resp.data.results[0].name : "",
            memberSlug: resp && resp.data && resp.data.results && resp.data.results[0] ? resp.data.results[0].slug : ""
          });
        });
        pathObj.previews = previews;
        this.context.setPath(pathObj);
        console.log("changing because nodeclick");
        this.props.setStatus({currentNode: node, currentPid: node.masterPid, previews});
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

  /**
   * If a save occurred in the SectionEditor, the user may have changed the slug/title. This callback is responsible for
   * updating the tree labels accordingly.
   */
  reportSave(id, newValue) {
    const {nodes} = this.state;
    const {localeDefault} = this.props;
    const node = this.locateNode.bind(this)("section", id);
    // Update the label based on the new value.
    if (node) {
      const defCon = node.data.content.find(c => c.locale === localeDefault);
      if (defCon) defCon.title = newValue;
      // todo: determine if this could be merged with formatTreeVariables
      node.label = this.formatLabel.bind(this)(newValue);
    }
    this.setState({nodes});
  }

  updateProfilesOnDimensionModify(profiles) {
    const {currentPid} = this.state;
    const thisProfile = profiles.find(p => p.id === currentPid);
    const masterMeta = thisProfile.meta;
    const requests = masterMeta.map(meta => {
      const levels = meta.levels ? meta.levels.join() : false;
      const levelString = levels ? `&levels=${levels}` : "";
      const url = `/api/search?q=&dimension=${meta.dimension}${levelString}&limit=1`;
      return axios.get(url);
    });
    const previews = [];
    Promise.all(requests).then(resps => {
      resps.forEach((resp, i) => {
        previews.push({
          slug: masterMeta[i].slug,
          id: resp && resp.data && resp.data.results && resp.data.results[0] ? resp.data.results[0].id : "",
          name: resp && resp.data && resp.data.results && resp.data.results[0] ? resp.data.results[0].name : "",
          memberSlug: resp && resp.data && resp.data.results && resp.data.results[0] ? resp.data.results[0].slug : ""
        });
      });
      this.setState({previews});
      this.setState({profiles}, this.buildNodes.bind(this, currentPid));
    });
  }

  onAddDimension(profileData) {
    const {currentPid, currentNode} = this.props.status;
    const ordering = currentNode.masterMeta.length;
    const payload = Object.assign({}, profileData, {profile_id: currentPid, ordering});
    axios.post("/api/cms/profile/upsertDimension", payload).then(resp => {
      const profiles = resp.data;
      this.updateProfilesOnDimensionModify.bind(this)(profiles);
    });
  }

  onDeleteDimension(profiles) {
    this.updateProfilesOnDimensionModify.bind(this)(profiles);
  }

  onEditDimension(profileData) {
    const payload = profileData;
    axios.post("/api/cms/profile/upsertDimension", payload).then(resp => {
      const profiles = resp.data;
      this.updateProfilesOnDimensionModify.bind(this)(profiles);
    });
  }

  onDimensionModify(action, payload) {
    if (action === "add") this.onAddDimension.bind(this)(payload);
    if (action === "delete") this.onDeleteDimension.bind(this)(payload);
    if (action === "edit") this.onEditDimension.bind(this)(payload);
  }

  formatLabel(str) {
    const {query, selectors} = this.state;
    const {variables} = this.props.status;
    const {localeDefault} = this.props;
    const formatters = this.context.formatters[localeDefault];
    const {stripHTML} = formatters;
    str = stripHTML(str);
    str = varSwapRecursive({str, selectors}, formatters, variables, query).str;
    return str;
  }

  /*
   * Callback for Preview.jsx, pass down new preview id to all Editors
   */
  onSelectPreview(newPreview) {
    const {pathObj} = this.props;
    const previews = this.props.status.previews.map(p => p.slug === newPreview.slug ? newPreview : p);
    this.context.setPath(Object.assign({}, pathObj, {previews}));
    console.log("changing because select");
    this.props.setStatus({previews});
  }

  /*
   * Callback for SectionEditor.jsx, when the user selects a dropdown in SelectorUsage.
   */
  onSelect(query) {
    this.setState({query}, this.formatTreeVariables.bind(this));
  }

  /*
   * Callback for updating selectors inside Toolbox
   */
  updateSelectors(selectors) {
    this.setState({selectors});
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
    const {currentPid} = this.props.status;
    const {localeDefault} = this.props;
    const p = this.locateProfileNodeByPid(currentPid);
    p.label = p.masterMeta.length > 0 ? p.masterMeta.map(d => d.slug).join("_") : "Add Dimensions";
    p.childNodes = p.childNodes.map(t => {
      const defCon = t.data.content.find(c => c.locale === localeDefault);
      const title = defCon && defCon.title ? defCon.title : t.data.slug;
      t.label = this.formatLabel.bind(this)(title);
      return t;
    });
    this.setState({nodes});
  }

  /**
   * Vizes have the ability to call setVariables({key: value}), which "breaks out" of the viz
   * and overrides/sets a variable in the variables object. This does not require a server
   * round-trip - we need only inject the variables object and trigger a re-render.
   */
  onSetVariables(newVariables) {
    const {variablesHash} = this.state;
    const {currentPid} = this.props.status;
    // Users should ONLY call setVariables in a callback - never in the main execution, as this
    // would cause an infinite loop. However, should they do so anyway, try and prevent the infinite
    // loop by checking if the vars are in there already, only updating if they are not yet set.
    const alreadySet = Object.keys(variablesHash[currentPid]).every(locale =>
      Object.keys(newVariables).every(key => variablesHash[currentPid][locale][key] === newVariables[key])
    );
    if (!alreadySet) {
      Object.keys(variablesHash[currentPid]).forEach(locale => {
        variablesHash[currentPid][locale] = Object.assign({}, variablesHash[currentPid][locale], newVariables);
      });
      this.setState({variablesHash});
    }
  }

  render() {

    const {nodes, nodeToDelete, selectors, toolboxVisible} = this.state;
    const {locale, localeDefault, profiles} = this.props;
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
                locale={locale}
                localeDefault={localeDefault}
                onSetVariables={this.onSetVariables.bind(this)}
                selectors={selectors}
                order={currNodeOrder}
                onSelect={this.onSelect.bind(this)}
                reportSave={this.reportSave.bind(this)}
              >
                <Header
                  title={currentNode.label}
                  parentTitle={currentNode.itemType !== "profile" &&
                    currentNode.parent.label
                  }
                  dimensions={previews}
                  slug={currentNode.data.slug}
                />

                <DimensionBuilder
                  meta={currentNode.masterMeta}
                  takenSlugs={profiles.map(p => p.meta).reduce((acc, d) => acc.concat(d.map(m => m.slug)), [])}
                />
              </Editor>
              : <NonIdealState title="No Profile Selected" description="Please select a Profile from the menu on the left." visual="path-search" />
            }

            <Toolbox
              id={currentPid}
              locale={locale}
              localeDefault={localeDefault}
              updateSelectors={this.updateSelectors.bind(this)}
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

ProfileBuilder.childContextTypes = {
  onSetVariables: PropTypes.func,
  onSelectPreview: PropTypes.func,
  onDimensionModify: PropTypes.func
};

ProfileBuilder.contextTypes = {
  formatters: PropTypes.object,
  setPath: PropTypes.func
};

const mapStateToProps = state => ({
  env: state.env,
  profiles: state.cms.profiles,
  status: state.cms.status
});

const mapDispatchToProps = dispatch => ({
  getProfiles: () => dispatch(getProfiles()),
  newProfile: () => dispatch(newProfile()),
  swapEntity: (type, id, dir) => dispatch(swapEntity(type, id, dir)),
  newSection: pid => dispatch(newSection(pid)),
  deleteSection: id => dispatch(deleteSection(id)),
  setStatus: status => dispatch(setStatus(status)),
  getCubeData: () => dispatch(getCubeData())
});

export default connect(mapStateToProps, mapDispatchToProps)(hot(ProfileBuilder));
