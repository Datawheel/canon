import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {hot} from "react-hot-loader/root";
import {Icon} from "@blueprintjs/core";

import sectionIconLookup from "../../utils/sectionIconLookup";

import {swapEntity, newEntity, deleteEntity} from "../../actions/profiles";

import Button from "../fields/Button";

import "./Outline.css";

class Outline extends Component {
  handleSectionClick(node) {
    const {tab} = this.props.status.pathObj;
    if (tab === "profiles") {
      this.props.handleClick.bind(this)({profile: node.profile_id, section: node.id, tab: "profiles"});
    }
    if (tab === "stories") {
      this.props.handleClick.bind(this)({story: node.story_id, storysection: node.id, tab: "stories"});
    }
  }

  createSection(node) {
    const ordering = node.ordering + 1;
    const {type} = node;
    const {tab} = this.props.status.pathObj;
    const {currentPid, currentStoryPid} = this.props.status;
    if (tab === "profiles") {
      const payload = {profile_id: currentPid, ordering};
      // Groups are special, when adding a new group it should "jump" past all the child sections and
      // Add itself before the next grouping, or, if there is none, at the end (but still as a Grouping)
      if (type === "Grouping") {
        payload.type = type;
        const nextGrouping = this.props.tree.find(s => s.type === "Grouping" && s.ordering > node.ordering);
        payload.ordering = nextGrouping ? nextGrouping.ordering : undefined;
      }
      this.props.newEntity("section", payload);
    }
    else if (tab === "stories") {
      const payload = {story_id: currentStoryPid, ordering};
      if (type === "Grouping") {
        payload.type = type;
        const nextGrouping = this.props.tree.find(s => s.type === "Grouping" && s.ordering > node.ordering);
        payload.ordering = nextGrouping ? nextGrouping.ordering : undefined;
      }
      this.props.newEntity("storysection", payload);
    }
  }

  /** group sections like they're grouped in profiles */
  groupSections() {
    const sections = this.props.tree;

    let groupedSections = [];
    // make sure there are sections to loop through
    if (sections.length) {
      // let the grouping begin
      groupedSections = sections.reduce((arr, section) => {
        // treat every section as a top level section up until the first grouping
        if (!arr.find(section => section.type === "Grouping") || section.type === "Grouping") {
          // add empty array for following sections to be grouped into
          if (section.type === "Grouping") section.sections = [];
          // push the section as a grouping
          arr.push(section);
        }
        // section follows a grouping; push it into the grouping's sections array
        else arr[arr.length - 1].sections.push(section);

        return arr;
      }, []);
    }

    return groupedSections;
  }

  /** generate the selected className depending on whether or not a node or its descendent are selected */
  getSelectedClass(node, nodes, sectionKey) {
    const {pathObj} = this.props.status;

    // node matches the current section id
    if (node.id === Number(pathObj[sectionKey])) return " is-selected";
    // nested node is selected
    else if (
      node.type === "Grouping" && node.sections &&
      node.sections.find(nestedSection => Number(nestedSection.id) === Number(pathObj[sectionKey]))
    ) {
      return " is-selected-parent";
    }
    return "";
  }

  /** avoids duplication */
  renderNode = (node, nodes, sectionKey, tree, i) => (
    <li className="cms-outline-item" key={node.id}>
      <a
        className={`cms-outline-link${this.getSelectedClass(node, nodes, sectionKey)}`}
        onClick={() => this.handleSectionClick.bind(this)(node)}
      >
        <Icon className="cms-outline-link-icon" icon={sectionIconLookup(node.type, node.position)} />
        {this.props.getNodeTitle(node)}
      </a>

      {/* add section / swap section position buttons */}
      <div className="cms-outline-item-actions cms-button">
        {/* add section */}
        <Button
          onClick={() => this.createSection(node)}
          className="cms-outline-item-actions-button"
          namespace="cms"
          fontSize="xxs"
          icon="plus"
          iconOnly
          key={`${node.id}-add-button`}
        >
          Add new section
        </Button>
        {/* swap section positions */}
        {i !== tree.length - 1 &&
          <Button
            onClick={() => this.props.swapEntity(sectionKey, node.id)}
            className="cms-outline-item-actions-button"
            namespace="cms"
            fontSize="xxs"
            icon="swap-horizontal"
            iconOnly
            key={`${node.id}-swap-button`}
          >
            Swap positioning of current and next sections
          </Button>
        }
      </div>
    </li>
  );

  render() {
    const {tree, isOpen} = this.props;
    const {pathObj} = this.props.status;

    if (!tree) return null;
    const nodes = this.groupSections();

    let sectionKey = "section";
    if (pathObj.story) sectionKey = "storysection";

    // when a grouping section is active, or a section nested in the grouping's section array is active
    const nestedOutline = nodes.find(section =>
      section.type === "Grouping" && section.id === Number(pathObj[sectionKey]) ||
      section.sections && section.sections.find(nestedSection => nestedSection.id === Number(pathObj[sectionKey]))
    );

    return <Fragment>
      {/* top row */}
      <ul className={`cms-outline ${isOpen ? "is-open" : "is-closed"}`} key="outline-main">
        {nodes.map((node, i) =>
          this.renderNode(node, nodes, sectionKey, nodes, i)
        )}
      </ul>

      {/* render nested list with current grouping's sections, if the current section is a grouping or within a group */}
      <ul className={`cms-outline cms-nested-outline ${nestedOutline && isOpen ? "is-open" : "is-closed"}`} key="outline-nested">
        {nestedOutline && nestedOutline.sections.map((node, i) =>
          this.renderNode(node, nodes, sectionKey, nestedOutline.sections, i)
        )}
      </ul>
    </Fragment>;
  }
}

const mapStateToProps = state => ({
  status: state.cms.status
});

const mapDispatchToProps = dispatch => ({
  newEntity: (type, payload) => dispatch(newEntity(type, payload)),
  swapEntity: (type, id) => dispatch(swapEntity(type, id)),
  deleteEntity: (type, payload) => dispatch(deleteEntity(type, payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(hot(Outline));
