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
import nestedObjectAssign from "../utils/nestedObjectAssign";
import sectionIconLookup from "../utils/sectionIconLookup";
import toKebabCase from "../utils/formatters/toKebabCase";

import varSwapRecursive from "../utils/varSwapRecursive";

import deepClone from "../utils/deepClone.js";

import "./ProfileBuilder.css";

const sectionIcons = {
  Card: "square",
  SingleColumn: "list",
  Tabs: "folder-close",
  Default: "list-detail-view"
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
      selectors: [],
      previews: [],
      cubeData: {},
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
    const treeGet = axios.get("/api/cms/tree");
    const cubeGet = axios.get("/api/cubeData");
    Promise.all([treeGet, cubeGet]).then(resp => {
      const profiles = resp[0].data;
      const cubeData = resp[1].data;
      this.setState({profiles, cubeData}, this.buildNodes.bind(this));
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
    const {profiles} = this.state;
    const {localeDefault} = this.props;
    const {stripHTML} = this.context.formatters[localeDefault];
    const nodes = profiles.map(p => ({
      id: `profile${p.id}`,
      hasCaret: true,
      label: p.meta.length > 0 ? p.meta.map(d => d.slug).join("_") : "Add Dimensions",
      itemType: "profile",
      masterPid: p.id,
      masterMeta: p.meta,
      data: p,
      childNodes: p.sections.map(t => {
        const defCon = t.content.find(c => c.locale === localeDefault);
        const title = defCon && defCon.title ? defCon.title : t.slug;
        return {
          id: `section${t.id}`,
          hasCaret: false,
          label: this.decode(stripHTML(title)),
          itemType: "section",
          masterPid: p.id,
          masterMeta: p.meta,
          data: t,
          icon: sectionIconLookup(t.type, t.position),
          className: `${toKebabCase(t.type)}-node`
        };
      })
    }));
    if (!openNode) {
      const {profile, section} = this.props.pathObj;
      if (section) {
        const nodeToOpen = this.locateNode("section", section, nodes);
        this.setState({nodes}, this.handleNodeClick.bind(this, nodeToOpen));
      }
      else if (profile) {
        const nodeToOpen = this.locateNode("profile", profile, nodes);
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
    if (n.itemType === "section") parentArray = this.locateNode("profile", n.data.profile_id).childNodes;
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
   * addItem is only ever used for sections, so lots of section-based assumptions are
   * made here. if this is ever expanded out again to be a generic "item" adder
   * then this will need to be generalized.
   */
  addItem(n, dir) {
    const {nodes} = this.state;
    const {localeDefault} = this.props;
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

    // New sections need to inherit their masterDimension from their parent.

    const obj = {
      hasCaret: false,
      itemType: "section",
      data: {}
    };
    obj.data.profile_id = n.data.profile_id;
    obj.data.ordering = loc;
    obj.masterPid = parent.masterPid;
    obj.masterMeta = parent.masterMeta;

    const sectionPath = "/api/cms/section/new";
    axios.post(sectionPath, obj.data).then(section => {
      if (section.status === 200) {
        obj.id = `section${section.data.id}`;
        obj.data = section.data;
        obj.icon = sectionIconLookup(section.data.type, section.data.position);
        obj.className = `${toKebabCase(section.data.type)}-node`;
        const defCon = section.data.content.find(c => c.locale === localeDefault);
        const title = defCon && defCon.title ? defCon.title : section.slug;
        obj.label = this.formatLabel.bind(this)(title);
        const parent = this.locateNode("profile", obj.data.profile_id);
        parent.childNodes.push(obj);
        parent.childNodes.sort((a, b) => a.data.ordering - b.data.ordering);
        this.setState({nodes}, this.handleNodeClick.bind(this, obj));
      }
      else {
        console.log("section error");
      }
    });
  }

  confirmDelete(n) {
    this.setState({nodeToDelete: n});
  }

  deleteItem(n) {
    const {nodes} = this.state;
    const {localeDefault} = this.props;
    // If this method is running, then the user has clicked "Confirm" in the Deletion Alert. Setting the state of
    // nodeToDelete back to false will close the Alert popover.
    const nodeToDelete = false;
    n = this.locateNode(n.itemType, n.data.id);
    // todo: instead of the piecemeal refreshes being done for each of these tiers - is it sufficient to run buildNodes again?
    if (n.itemType === "section") {
      const parent = this.locateNode("profile", n.data.profile_id);
      axios.delete("/api/cms/section/delete", {params: {id: n.data.id}}).then(resp => {
        const sections = resp.data.map(sectionData => {
          const defCon = sectionData.content.find(c => c.locale === localeDefault);
          const title = defCon && defCon.title ? defCon.title : sectionData.slug;
          return {
            id: `section${sectionData.id}`,
            hasCaret: false,
            iconName: sectionIcons[sectionData.type] || "help",
            label: this.formatLabel.bind(this)(title),
            itemType: "section",
            masterPid: parent.masterPid,
            masterMeta: parent.masterMeta,
            data: sectionData
          };
        });
        parent.childNodes = sections;
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
    const {nodes, currentNode, previews} = this.state;
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
      this.setState({currentNode: node});
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
      // get the last node
      const {nodes} = this.state;
      const latestNode = nodes[nodes.length - 1];
      // switch to the new node
      this.handleNodeClick(latestNode);
    }, 70);
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
      this.setState({profiles, previews}, this.buildNodes.bind(this, currentPid));
    });
  }

  onAddDimension(profileData) {
    const {currentPid, currentNode} = this.state;
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
    axios.post("api/cms/profile/upsertDimension", payload).then(resp => {
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
    const {variablesHash, currentPid, query, selectors} = this.state;
    const {localeDefault} = this.props;
    const formatters = this.context.formatters[localeDefault];
    const {stripHTML} = formatters;
    const variables = variablesHash[currentPid] && variablesHash[currentPid][localeDefault] ? deepClone(variablesHash[currentPid][localeDefault]) : {};
    str = this.decode(stripHTML(str));
    str = varSwapRecursive({str, selectors}, formatters, variables, query).str;
    // str =  <span dangerouslySetInnerHTML={{__html: varSwapRecursive({str, selectors}, formatters, variables, query).str}} />;
    return str;
  }

  /*
   * Callback for Preview.jsx, pass down new preview id to all Editors
   */
  onSelectPreview(newPreview) {
    const {pathObj} = this.props;
    const previews = this.state.previews.map(p => p.slug === newPreview.slug ? newPreview : p);
    this.context.setPath(Object.assign({}, pathObj, {previews}));
    this.setState({previews});
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
    const {currentPid, nodes} = this.state;
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
   * Certain events in the Editors, such as saving a generator, can change the resulting
   * variables object. In order to ensure that this new variables object is passed down to
   * all the editors, each editor has a callback that accesses this function. We store the
   * variables object in a hash that is keyed by the profile id.
   */
  fetchVariables(callback, config) {
    const {variablesHash, currentPid, previews} = this.state;
    const {locale, localeDefault} = this.props;
    const maybeCallback = () => {
      if (callback) callback();
      this.formatTreeVariables.bind(this)();
    };
      
    if (!variablesHash[currentPid]) variablesHash[currentPid] = {};
    if (!variablesHash[currentPid][localeDefault]) variablesHash[currentPid][localeDefault] = {_genStatus: {}, _matStatus: {}};
    if (locale && !variablesHash[currentPid][locale]) variablesHash[currentPid][locale] = {_genStatus: {}, _matStatus: {}};

    const locales = [localeDefault];
    if (locale) locales.push(locale);
    for (const thisLocale of locales) {

      // If the config is for a materializer, don't run generators. Just use our current variables for the POST action
      if (config && config.type === "materializer") {
        let paramString = "";
        previews.forEach((p, i) => {
          paramString += `&slug${i + 1}=${p.slug}&id${i + 1}=${p.id}`;
        });
        const mid = config.ids[0];
        const query = {materializer: mid};
        Object.keys(query).forEach(k => {
          paramString += `&${k}=${query[k]}`;
        });
        // However, the user may have deleted a variable from their materializer. Clear out this materializer's variables 
        // BEFORE we send the variables payload - so they will be filled in again properly from the POST response.
        if (variablesHash[currentPid][thisLocale]._matStatus[mid]) {
          Object.keys(variablesHash[currentPid][thisLocale]._matStatus[mid]).forEach(k => {
            delete variablesHash[currentPid][thisLocale][k]; 
          });
          delete variablesHash[currentPid][thisLocale]._matStatus[mid];
        }
        // Once pruned, we can POST the variables to the materializer endpoint
        axios.post(`/api/materializers/${currentPid}?locale=${thisLocale}${paramString}`, {variables: variablesHash[currentPid][thisLocale]}).then(mat => {
          variablesHash[currentPid][thisLocale] = nestedObjectAssign({}, variablesHash[currentPid][thisLocale], mat.data);
          this.setState({variablesHash}, maybeCallback);
        });
      }
      else {
        const gids = config.ids || [];
        for (const gid of gids) {
          if (variablesHash[currentPid][thisLocale]._genStatus[gid]) {
            Object.keys(variablesHash[currentPid][thisLocale]._genStatus[gid]).forEach(k => {
              delete variablesHash[currentPid][thisLocale][k];
            });
          }
          delete variablesHash[currentPid][thisLocale]._genStatus[gid];
        }
        for (const gid of gids) {
          const query = {generator: gid};
          let paramString = "";
          previews.forEach((p, i) => {
            paramString += `&slug${i + 1}=${p.slug}&id${i + 1}=${p.id}`;
          });
          Object.keys(query).forEach(k => {
            paramString += `&${k}=${query[k]}`;
          });
          axios.get(`/api/generators/${currentPid}?locale=${thisLocale}${paramString}`).then(gen => {
            variablesHash[currentPid][thisLocale] = nestedObjectAssign({}, variablesHash[currentPid][thisLocale], gen.data);
            let gensLoaded = Object.keys(variablesHash[currentPid][thisLocale]._genStatus).filter(d => gids.includes(Number(d))).length;
            const gensTotal = gids.length;
            const genLang = thisLocale;
            // If the user is deleting a generator, then this function was called with a single gid (the one that was deleted)
            // The pruning code above already removed its vars and _genStatus from the original vars, so the loading progress
            // Can't know what to wait for. In this single instance, use this short-circuit to be instantly done and move onto mats.
            if (gids.length === 1 && JSON.stringify(gen.data) === "{}") gensLoaded = 1;
            this.setState({variablesHash, gensLoaded, gensTotal, genLang}, maybeCallback);
            if (gensLoaded === gids.length) {
              // Clean out stale materializers (see above comment)
              Object.keys(variablesHash[currentPid][thisLocale]._matStatus).forEach(mid => {
                Object.keys(variablesHash[currentPid][thisLocale]._matStatus[mid]).forEach(k => {
                  delete variablesHash[currentPid][thisLocale][k]; 
                });
                delete variablesHash[currentPid][thisLocale]._matStatus[mid];
              });
              axios.post(`/api/materializers/${currentPid}?locale=${thisLocale}${paramString}`, {variables: variablesHash[currentPid][thisLocale]}).then(mat => {
                variablesHash[currentPid][thisLocale] = nestedObjectAssign({}, variablesHash[currentPid][thisLocale], mat.data);
                this.setState({variablesHash}, maybeCallback);
              });
            }
          });
        }
      }
    }
  }

  /**
   * Vizes have the ability to call setVariables({key: value}), which "breaks out" of the viz
   * and overrides/sets a variable in the variables object. This does not require a server
   * round-trip - we need only inject the variables object and trigger a re-render.
   */
  onSetVariables(newVariables) {
    const {variablesHash, currentPid} = this.state;
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

    const {nodes, currentNode, variablesHash, currentPid, gensLoaded, gensTotal, genLang, previews, profiles, cubeData, nodeToDelete, selectors, toolboxVisible} = this.state;
    const {locale, localeDefault} = this.props;

    if (!nodes) return null;
  
    const variables = variablesHash[currentPid] ? deepClone(variablesHash[currentPid]) : null;

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
                previews={previews}
                onSetVariables={this.onSetVariables.bind(this)}
                variables={variables}
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
                  cubeData={cubeData}
                  meta={currentNode.masterMeta}
                  takenSlugs={profiles.map(p => p.meta).reduce((acc, d) => acc.concat(d.map(m => m.slug)), [])}
                  previews={previews}
                  onAddDimension={this.onAddDimension.bind(this)}
                  onDeleteDimension={this.onDeleteDimension.bind(this)}
                />
              </Editor>
              : <NonIdealState title="No Profile Selected" description="Please select a Profile from the menu on the left." visual="path-search" />
            }

            <Toolbox
              id={currentPid}
              locale={locale}
              localeDefault={localeDefault}
              updateSelectors={this.updateSelectors.bind(this)}
              variables={variables}
              fetchVariables={this.fetchVariables.bind(this)}
              previews={previews}
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

export default connect(state => ({env: state.env}))(hot(ProfileBuilder));
