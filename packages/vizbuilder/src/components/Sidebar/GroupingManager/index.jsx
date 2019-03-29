import {Button} from "@blueprintjs/core";
import classnames from "classnames";
import React from "react";

import SidebarCRUDManager from "../SidebarCRUDManager";

import Grouping from "./Grouping";
import GroupingItem from "./GroupingItem";
import {
  IncompleteParameter,
  NoMoreOptions,
  DimensionInUse
} from "../../../helpers/errors";
import {getGeoLevel} from "../../../helpers/sorting";

class GroupingManager extends SidebarCRUDManager {
  constructor(props) {
    super(props);
    this.targetLabel = "groups";

    const usedDimensions = this.getUsedDimensions(props.items);
    this.state = {
      unusedOptions: this.getUnusedOptions(props.itemOptions, usedDimensions)
    };
  }

  componentDidUpdate(prevProps) {
    const {items, itemOptions} = this.props;
    if (prevProps.items !== items) {
      const usedDimensions = this.getUsedDimensions(items);
      const unusedOptions = this.getUnusedOptions(itemOptions, usedDimensions);
      this.setState({unusedOptions});
    }
  }

  render() {
    const {className, label, items, forcedLimit} = this.props;

    const disableAdd =
      this.state.unusedOptions.length === 0 ||
      (forcedLimit !== undefined && items.length >= forcedLimit);

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
          disabled={disableAdd}
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
      options: this.getUnusedOptions(this.props.itemOptions, usedDimensions),
      query: this.props.query
    });
  }

  createNewInstance() {
    const {unusedOptions} = this.state;
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
    if (!item.level) {
      throw new IncompleteParameter("You must select a property.");
    }

    const currentGroupings = this.props.items.filter(
      group => group.uuid !== item.uuid
    );
    const usedDimensions = this.getUsedDimensions(currentGroupings);
    if (usedDimensions.indexOf(item.level.hierarchy.dimension) > -1) {
      throw new DimensionInUse();
    }
  }

  postUpdateHook(partialState) {
    const partialQuery = partialState.query;
    partialQuery.geoLevel = getGeoLevel(partialQuery);
    return partialState;
  }

  getUsedDimensions(groups) {
    return groups
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
