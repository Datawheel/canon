import React from "react";

import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";

import {defaultProps} from "../../src";
import UpdatedMemberSelect from "../../src/components/MemberSelect";
import {resetClient} from "../../src/helpers/api";
import {fetchCubes, fetchMembers} from "../../src/helpers/fetch";
import initialStateFactory from "../../src/state";
import {ENDPOINT} from "./params";

class MultiSelectPage extends React.PureComponent {
  state = initialStateFactory();

  componentDidMount() {
    const fetchParams = {
      defaultMeasure: "Total Population",
      defaultTable: "",
      defaultGroup: [
        "Geography.State",
        "Origin State.Origin State",
        "Gender.Gender",
        "Age.Age"
      ]
    };
    resetClient(ENDPOINT);
    fetchCubes(fetchParams, defaultProps).then(state => {
      const level = state.query.cube.dimensions[0].hierarchies[0].levels.slice().pop();
      return fetchMembers(state.query, level).then(members => {
        state.items = members;
        state.selectedItems = [];
        this.setState(state);
      });
    });
  }

  selectHandler = item => {
    console.log("Selected:", item);
    this.setState(state => ({selectedItems: [].concat(state.selectedItems, item)}));
  };

  deleteHandler = label => {
    console.log("Deleted:", label);
    this.setState(state => ({
      selectedItems: state.selectedItems.filter(item => item.caption === label)
    }));
  };

  clearHandler = () => {
    console.log("Cleared");
    this.setState({selectedItems: []});
  };

  render() {
    const {items = [], selectedItems = []} = this.state;
    const maxDepth = items[0] && items[0].ancestors.length - 1;
    return (
      <div className="site-wrapper">
        <UpdatedMemberSelect
          items={items}
          onItemSelect={this.selectHandler}
          selectedItems={selectedItems}
          maxDepth={maxDepth || 1}
          // onClear
          // onItemRemove
        />
      </div>
    );
  }
}

export default MultiSelectPage;
