import {Button} from "@blueprintjs/core";
import classnames from "classnames";
import React from "react";

import SidebarCRUDManager from "../SidebarCRUDManager";

import Grouping from "./Grouping";
import GroupingItem from "./GroupingItem";

class GroupingManager extends SidebarCRUDManager {
  constructor(props) {
    super(props);
    this.targetLabel = "groups";
    this.state = {
      realOptions: this.calculateRealOptions(props.itemOptions, props.items)
    };
  }

  render() {
    const {className, label, items} = this.props;

    return (
      <div className={classnames("grouping-manager", className)}>
        <p className="label">{label}</p>
        <div className="grouping-items">
          {items.map(this.renderElement, this)}
        </div>
        <Button
          text="Add grouping"
          className="pt-fill"
          iconName="insert"
          onClick={this.createElement}
        />
      </div>
    );
  }

  /** @param {Grouping} item */
  renderElement(item) {
    return React.createElement(GroupingItem, {
      key: item.uuid,
      item,
      onDelete: this.deleteElement,
      onUpdate: this.updateElement,
      options: this.state.realOptions
    });
  }

  createNewInstance() {
    const realOptions = this.calculateRealOptions(
      this.props.itemOptions,
      this.props.items
    );
    if (!realOptions.length) {
      throw new Error(
        "There's no more dimensions you can select for this measure."
      );
    }
    this.setState({realOptions});
    const newItem = new Grouping();
    newItem.new = true;
    return newItem;
  }

  calculateRealOptions(options, items) {
    const usedDimensions = items
      .map(item => item.level && item.level.hierarchy.dimension)
      .filter(Boolean);
    return options.filter(
      level => usedDimensions.indexOf(level.hierarchy.dimension) === -1
    );
  }
}

export default GroupingManager;
