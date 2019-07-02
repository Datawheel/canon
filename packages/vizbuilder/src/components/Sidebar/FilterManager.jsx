import React from "react";
import classNames from "classnames";
import {Button} from "@blueprintjs/core";

import Filter from "../../helpers/Filter";
import FilterItem from "./FilterItem";
import SidebarCRUDManager from "./SidebarCRUDManager";

class FilterManager extends SidebarCRUDManager {
  constructor(props) {
    super(props);
    this.targetLabel = "filters";
  }

  render() {
    const {className, label, items} = this.props;

    return (
      <div className={classNames("filter-manager", className)}>
        <p className="label">{label}</p>
        <div className="filter-items">
          {items.map(this.renderElement, this)}
        </div>
        <Button
          text="Add filter"
          className="bp3-fill"
          icon="insert"
          onClick={this.createElement}
        />
      </div>
    );
  }

  /** @param {Filter} item */
  renderElement(item) {
    return React.createElement(FilterItem, {
      key: item.uuid,
      item,
      onDelete: this.deleteElement,
      onUpdate: this.updateElement,
      options: this.props.itemOptions
    });
  }

  createNewInstance() {
    const newItem = new Filter();
    newItem.new = true;
    return newItem;
  }
}

export default FilterManager;
