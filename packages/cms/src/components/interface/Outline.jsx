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

  createSection(id) {
    const {tab} = this.props.status.pathObj;
    const {currentPid, currentStoryPid} = this.props.status;
    if (tab === "profiles") {
      this.props.newEntity("section", {profile_id: currentPid});
    }
    if (tab === "stories") {
      this.props.newEntity("storysection", {story_id: currentStoryPid});
    }
  }

  swapSections(id) {
    const {tab} = this.props.status.pathObj;
    if (tab === "profiles") {
      this.props.swapEntity("section", id);
    }
    if (tab === "stories") {
      this.props.swapEntity("storysection", id);
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
        // treat the first section as a grouping
        if (arr.length === 0 || section.type === "Grouping") {
          section.sections = []; // add emtpty array for following sections to be nested into
          arr.push(section); // push the section as a grouping
        }
        else arr[arr.length - 1].sections.push(section);
        return arr;
      }, []);
    }

    return groupedSections;
  }

  render() {
    const {tree, isOpen} = this.props;
    const {pathObj} = this.props.status;

    if (!tree) return null;
    const nodes = this.groupSections();

    let sectionKey = "section";
    if (pathObj.story) sectionKey = "storysection";

    // when a grouping section is active, or a section nested in the groupings' section array is active
    const nestedOutline = nodes.find(section =>
      section.type === "Grouping" && section.id === Number(pathObj[sectionKey]) ||
      section.sections && section.sections.find(nestedSection => nestedSection.id === Number(pathObj[sectionKey]))
    );

    return <Fragment>
      {/* top row */}
      <ul className={`cms-outline ${isOpen ? "is-open" : "is-closed"}`} key="outline-main">
        {nodes.map((node, i) =>
          <li className="cms-outline-item" key={node.id}>
            <a
              className={`cms-outline-link${
                pathObj[sectionKey] && Number(pathObj[sectionKey]) === node.id
                  ? " is-selected" // current node
                  : ""
              }`}
              onClick={() => this.handleSectionClick.bind(this)(node)}
            >
              <Icon className="cms-outline-link-icon" icon={sectionIconLookup(node.type, node.position)} />
              {this.props.getNodeTitle(node)}
            </a>

            {/* add section / swap section position buttons */}
            <div className="cms-outline-item-actions cms-button">
              {/* add section */}
              <Button
                onClick={() => this.createSection(node.id)}
                className="cms-outline-item-actions-button"
                namespace="cms"
                fontSize="xxs"
                icon="plus"
                iconOnly
                key={`${node.id}-add-button`}
              >
                Add new section
              </Button>
              {/* swap section positions (not shown for last section) */}
              {i !== tree.length - 1 &&
                <Button
                  onClick={() => this.swapSections(node.id)}
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
        )}
      </ul>

      {/* render nested list with current grouping's sections, if the current section is a grouping or within a group */}
      {console.log(nestedOutline)}
      <ul className={`cms-outline cms-nested-outline ${nestedOutline ? "is-open" : "is-closed"}`} key="outline-nested">
        {nestedOutline && nestedOutline.sections.map((node, i) =>
          <li className="cms-outline-item" key={node.id}>
            <a
              className={`cms-outline-link${
                pathObj.section && Number(pathObj.section) === node.id || pathObj.storysection && Number(pathObj.storysection === node.id)
                  ? " is-selected" // current node
                  : ""
              }`}
              onClick={() => this.handleSectionClick.bind(this)(node)}
            >
              <Icon className="cms-outline-link-icon" icon={sectionIconLookup(node.type, node.position)} />
              {this.props.getNodeTitle(node)}
            </a>

            {/* add section / swap section position buttons */}
            <div className="cms-outline-item-actions cms-button">
              {/* add section */}
              <Button
                onClick={() => this.createSection(node.id)}
                className="cms-outline-item-actions-button"
                namespace="cms"
                fontSize="xxs"
                icon="plus"
                iconOnly
                key={`${node.id}-add-button`}
              >
                Add new section
              </Button>
              {/* swap section positions (not shown for last section) */}
              {i !== tree.length - 1 &&
                <Button
                  onClick={() => this.swapSections(node.id)}
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
