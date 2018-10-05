import {Button} from "@blueprintjs/core";
import classnames from "classnames";
import React from "react";

import SidebarCRUDManager from "../SidebarCRUDManager";

import Grouping from "./Grouping";
import GroupingItem from "./GroupingItem";
import {IncompleteParameter, NoMoreOptions, DimensionInUse} from "../../../helpers/errors";

class GroupingManager extends SidebarCRUDManager {
  constructor(props) {
    super(props);
    this.targetLabel = "groups";

    const usedDimensions = this.getUsedDimensions(props.items);
    this.state = {
      unusedOptions: this.getUnusedOptions(props.itemOptions, usedDimensions)
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
          disabled={this.state.unusedOptions.length === 0}
          onClick={this.createElement}
        />
      </div>
    );
  }

  /** @param {Grouping} item */
  renderElement(item) {
    const usedDimensions = this.getUsedDimensions(this.props.items);
    if (item.level) {
      const itemDimension = item.level.hierarchy.dimension;
      const index = usedDimensions.indexOf(itemDimension);
      usedDimensions.splice(index, 1);
    }

    return React.createElement(GroupingItem, {
      key: item.uuid,
      item,
      onDelete: this.deleteElement,
      onUpdate: this.updateElement,
      options: this.getUnusedOptions(this.props.itemOptions, usedDimensions)
    });
  }

  createNewInstance() {
    const usedDimensions = this.getUsedDimensions(this.props.items);
    const unusedOptions = this.getUnusedOptions(
      this.props.itemOptions,
      usedDimensions
    );
    this.setState({unusedOptions});
    if (!unusedOptions.length) {
      throw new NoMoreOptions(
        "There's no more dimensions you can select for this measure."
      );
    }
    const newItem = new Grouping();
    newItem.new = true;
    return newItem;
  }

  preUpdateHook(item) {
    console.log(item);

    if (!item.level) {
      throw new IncompleteParameter('You must select a property.');
    }

    const usedDimensions = this.getUsedDimensions(this.props.items);
    if (usedDimensions.indexOf(item.level.hierarchy.dimension) > -1) {
      throw new DimensionInUse();
    }
  }

  getUsedDimensions(items) {
    return this.props.items
      .filter(item => item.level)
      .map(item => item.level.hierarchy.dimension);
  }

  getUnusedOptions(allOptions, usedDimensions) {
    return allOptions.filter(
      level => usedDimensions.indexOf(level.hierarchy.dimension) === -1
    );
  }
}

export default GroupingManager;
