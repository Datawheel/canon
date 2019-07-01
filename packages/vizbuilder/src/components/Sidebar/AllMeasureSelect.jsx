import {Button, MenuItem, Classes} from "@blueprintjs/core";
import {Select} from "@blueprintjs/select";
import escapeRegExp from "lodash/escapeRegExp";
import React from "react";
import memoizeOne from "memoize-one";
import classNames from "classnames";

import CategoryListRenderer from "./CategoryListRenderer";
import VirtualListRenderer from "./VirtualListRenderer";

class UpdatedMeasureSelect extends React.Component {
  constructor(props) {
    super(props);

    this.renderItemList = this.renderItemList.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.itemSelectHandler = this.itemSelectHandler.bind(this);

    this.baseListComposer = memoizeOne(items => {
      // This function supposes the list was previously sorted by headers
      const {selectedItem, itemMap} = this.props;
      let lastTopic, lastSubtopic;

      return items.reduce((output, item) => {
        // Compose headers by category
        const topic = item.annotations._cb_topic;
        const subtopic = item.annotations._cb_subtopic;
        if (topic !== lastTopic || subtopic !== lastSubtopic) {
          lastTopic = topic;
          lastSubtopic = subtopic;
          output.push({isOptgroup: true, topic, subtopic});
        }
        // Adds the item only if it wasn't added from another dataset previously
        const key = `${item.annotations._cb_table_id}.${item.name}`;
        const tableMap = itemMap[key];
        if (tableMap && tableMap.length > 0) {
          // if selectedItem is from the current tableMap, use it, else use first
          const isSelectedInTable = tableMap.indexOf(selectedItem) > -1;
          const representativeItem = isSelectedInTable ? selectedItem : tableMap[0];
          if (output.indexOf(representativeItem) === -1) {
            output.push(representativeItem);
          }
        }
        else {
          output.push(item);
        }
        return output;
      }, []);
    });

    this.categoryListComposer = memoizeOne((stack, items) => {
      const depth = stack.length;

      if (depth === 0) {
        const topicMap = {};
        let n = items.length;
        while (n--) {
          const measure = items[n];
          if (measure.isOptgroup) continue;
          const label = measure.annotations._cb_topic;
          topicMap[label] = true;
        }
        return Object.keys(topicMap).sort();
      }

      if (depth === 1) {
        const topic = stack[0];
        const subtopicMap = {};
        let n = items.length;
        while (n--) {
          const measure = items[n];
          if (measure.isOptgroup) continue;
          const measureAnn = measure.annotations;
          if (measureAnn._cb_topic === topic) {
            subtopicMap[measureAnn._cb_subtopic] = true;
          }
        }
        return Object.keys(subtopicMap).sort();
      }

      const [topic, subtopic] = stack;
      return items.filter(
        measure =>
          !measure.isOptgroup &&
          (measure.annotations._cb_topic === topic &&
            measure.annotations._cb_subtopic === subtopic)
      );
    });
  }

  itemListPredicate(query, items) {
    query = query.trim();
    query = escapeRegExp(query).replace(/\s+/g, "[^_]+");
    const queryTester = RegExp(query || ".", "i");
    return items
      .filter(item => item.isOptgroup || queryTester.test(item.annotations._searchIndex))
      .filter(
        (item, index, array) =>
          !item.isOptgroup || (array[index + 1] && !array[index + 1].isOptgroup)
      );
  }

  render() {
    const {items, selectedItem, disabled} = this.props;

    if (!selectedItem) {
      return <Button disabled={true} text="Loading measures..." />;
    }

    const itemsToDisplay = this.baseListComposer(items);
    const popoverProps = {
      boundary: "viewport",
      minimal: true,
      targetTagName: "div",
      wrapperTagName: "div"
    };
    return (
      <Select
        disabled={disabled}
        itemDisabled="isOptgroup"
        itemListPredicate={this.itemListPredicate}
        itemListRenderer={this.renderItemList}
        itemRenderer={this.renderItem}
        items={itemsToDisplay}
        onItemSelect={this.itemSelectHandler}
        popoverProps={popoverProps}
        resetOnClose={true}
      >
        <Button
          alignText="left"
          className="measure-select select-option active"
          fill={true}
          rightIcon="double-caret-vertical"
          text={<MeasureItem {...selectedItem} showSource />}
          title={selectedItem.name}
        />
      </Select>
    );
  }

  /** @param {import("@blueprintjs/select").IItemListRendererProps} itemListProps */
  renderItemList(itemListProps) {
    if (itemListProps.query) {
      return (
        <VirtualListRenderer
          {...itemListProps}
          itemRenderer={this.renderItem}
          onItemSelect={this.itemSelectHandler}
        />
      );
    }
    else {
      return (
        <CategoryListRenderer
          {...itemListProps}
          itemListComposer={this.categoryListComposer}
          maxDepth={2}
        />
      );
    }
  }

  renderItem(item, {handleClick, index, modifiers, query}) {
    if (item.isOptgroup) {
      return (
        <li
          key={`${item.topic} ${item.subtopic}`}
          className={classNames(Classes.MENU_HEADER, "measure-select optgroup")}
        >
          <h4 className="measure-label">
            <span className="topic">{item.topic}</span>
            <span className="subtopic">{item.subtopic}</span>
          </h4>
        </li>
      );
    }

    return (
      <MenuItem
        active={modifiers.active}
        className="measure-select option"
        disabled={modifiers.disabled}
        key={`${item.annotations._cb_name} ${item.name}`}
        onClick={handleClick}
        text={<MeasureItem {...item} showDimensions />}
        title={item.name}
      />
    );
  }

  itemSelectHandler(item, evt) {
    const {onItemSelect} = this.props;
    onItemSelect && onItemSelect(item, evt);
  }
}

function MeasureItem(props) {
  return (
    <span className="measure-label">
      <span className="name">{props.name}</span>
      {props.showSource && (
        <span className="source">{props.annotations._cb_tagline}</span>
      )}
      {props.showDimensions && (
        <span className="dimensions">
          {props.annotations._dim_labels.map(label => (
            <span className="bp3-tag">{label}</span>
          ))}
        </span>
      )}
    </span>
  );
}

export default UpdatedMeasureSelect;
