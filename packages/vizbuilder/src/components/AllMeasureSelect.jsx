import {Button, Classes, MenuItem} from "@blueprintjs/core";
import {Select} from "@blueprintjs/select";
import classNames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";
import memoizeOne from "memoize-one";
import React, {Component} from "react";
import CategoryListRenderer from "./CategoryListRenderer";
import VirtualListRenderer from "./VirtualListRenderer";

/**
 * @typedef OwnProps
 * @property {string} className
 * @property {boolean} [disabled]
 * @property {MeasureItem[]} items
 * @property {{[tableId: string]: MeasureItem[]}} itemMap
 * @property {MeasureItem} selectedItem
 * @property {(measure: MeasureItem, event: React.SyntheticEvent<HTMLElement>) => any} onItemSelect
 */

/** @extends {Component<OwnProps,{}>} */
class MeasureSelect extends Component {
  constructor(props) {
    super(props);

    this.renderItemList = this.renderItemList.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.itemSelectHandler = this.itemSelectHandler.bind(this);

    this.baseListComposer = memoizeOne(
      /** @param {MeasureItem[]} items */

      items => {
        // This function supposes the list was previously sorted by headers
        const {selectedItem, itemMap} = this.props;
        let lastTopic, lastSubtopic;

        return items.reduce((output, item) => {
          // Compose headers by category
          const topic = item.topic;
          const subtopic = item.subtopic;
          if (topic !== lastTopic || subtopic !== lastSubtopic) {
            lastTopic = topic;
            lastSubtopic = subtopic;
            output.push({isOptgroup: true, topic, subtopic});
          }
          // Adds the item only if it wasn't added from another dataset previously
          const tableMap = itemMap[`${item.tableId}`];
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
      }
    );

    this.categoryListComposer = memoizeOne(
      /**
       * @param {any} stack
       * @param {MeasureItem[]} items
       */
      (stack, items) => {
        const depth = stack.length;

        if (depth === 0) {
          const topicMap = {};
          let n = items.length;
          while (n--) {
            const measure = items[n];
            if (measure.isOptgroup) continue;
            topicMap[measure.topic] = true;
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
            if (measure.topic === topic) {
              subtopicMap[measure.subtopic] = true;
            }
          }
          return Object.keys(subtopicMap).sort();
        }

        const [topic, subtopic] = stack;
        return items.filter(
          measure =>
            !measure.isOptgroup &&
            (measure.topic === topic && measure.subtopic === subtopic)
        );
      }
    );
  }

  /**
   * @type {import("@blueprintjs/select").ItemListPredicate<MeasureItem>}
   * @param {string} query
   * @param {MeasureItem[]} items
   */
  itemListPredicate(query, items) {
    query = query.trim();
    query = escapeRegExp(query).replace(/\s+/g, "[^_]+");
    const queryTester = RegExp(query || ".", "i");
    return items
      .filter(item => item.isOptgroup || queryTester.test(item.searchIndex))
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
    return (
      <Select
        disabled={disabled}
        itemDisabled="isOptgroup"
        itemListPredicate={this.itemListPredicate}
        itemListRenderer={this.renderItemList}
        itemRenderer={this.renderItem}
        items={itemsToDisplay}
        onItemSelect={this.itemSelectHandler}
        popoverProps={{
          boundary: "viewport",
          minimal: true,
          targetTagName: "div",
          wrapperTagName: "div"
        }}
        resetOnClose={true}
      >
        <Button
          alignText="left"
          className="measure-select select-option active"
          fill={true}
          rightIcon="double-caret-vertical"
          text={<MeasureMenuItem {...selectedItem} showSource />}
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
        key={item.uri}
        onClick={handleClick}
        text={<MeasureMenuItem {...item} showDimensions />}
        title={item.name}
      />
    );
  }

  itemSelectHandler(item, evt) {
    const {onItemSelect} = this.props;
    onItemSelect && onItemSelect(item, evt);
  }
}

/** @type {React.FC<MeasureItem&{showSource?:boolean}>} */
const MeasureMenuItem = function(props) {
  return (
    <span className="measure-label">
      <span className="name">{props.name}</span>
      {props.showSource && <span className="source">{props.sourceName}</span>}
      {props.dimNames.length > 0 && (
        <span className="dimensions">
          {props.dimNames.map(label => <span className="bp3-tag">{label}</span>)}
        </span>
      )}
    </span>
  );
};

export default MeasureSelect;
