import {Button, Intent, MenuDivider, MenuItem, Spinner} from "@blueprintjs/core";
import {MultiSelect} from "@blueprintjs/select";
import classNames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";
import memoizeOne from "memoize-one";
import keyBy from "lodash/keyBy"
import React, {Component} from "react";

import CategoryListRenderer from "./CategoryListRenderer";
import VirtualListRenderer from "./VirtualListRenderer";

/**
 * @typedef MemberOptgroup
 * @property {boolean} isOptgroup
 * @property {string} caption
 */

/**
 * @typedef OwnProps
 * @property {boolean} loading
 * @property {number} maxDepth
 * @property {() => void} onClear
 * @property {(item: MemberItem, evt?: React.SyntheticEvent<HTMLElement>) => void} onItemSelect
 * @property {(key: string, index: number) => void} onItemRemove
 * @property {MemberItem[]} options
 * @property {string[]} selectedItems
 */

/** @extends {Component<OwnProps, {}>} */
class MemberSelect extends Component {
  baseListComposer = memoizeOne(
    /** @type {(items: MemberItem[]) => (MemberItem | MemberOptgroup)[]} */
    items => {
      /** @type {(MemberItem | MemberOptgroup)[]} */
      const target = [];
      let lastParentCaption;
      return items.reduce((output, item) => {
        const ancestor = item.ancestors[0];
        if (ancestor && lastParentCaption !== ancestor.name) {
          lastParentCaption = ancestor.name;
          output.push({isOptgroup: true, caption: ancestor.name});
        }
        output.push(item);
        return output;
      }, target);
    }
  );

  categoryListComposer = memoizeOne(
    /** @type {(stack: string[], items: MemberItem[], maxDepth: number) => any} */
    (stack, items, maxDepth) => {
      const depth = stack.length;
      const isCategoryMember = member =>
        !member.isOptgroup &&
        stack.every(
          (parent, index) => getAncestor(member, maxDepth, index).name === parent
        );

      if (depth < maxDepth) {
        const parentMap = {};
        let n = items.length;
        while (n--) {
          const member = items[n];
          if (!isCategoryMember(member)) continue;
          const {name} = getAncestor(member, maxDepth, depth);
          parentMap[name] = true;
        }
        return Object.keys(parentMap).sort();
      }

      return items.filter(isCategoryMember);
    }
  );

  /** @type {import("@blueprintjs/select").ItemListPredicate<MemberItem | MemberOptgroup>} */
  itemListPredicate = (query, items) => {
    query = query.trim();
    query = escapeRegExp(query).replace(/\s+/g, "[^_]+");
    const queryTester = RegExp(query || ".", "i");
    return items
      .filter(item => "isOptgroup" in item || queryTester.test(item.name))
      .filter(
        (item, index, array) =>
          !item.isOptgroup || (array[index + 1] && !array[index + 1].isOptgroup)
      );
  };

  clearHandler = () => {
    const {onClear} = this.props;
    typeof onClear === "function" && onClear();
  }

  /** @type {(item: MemberItem, evt?: React.SyntheticEvent<HTMLElement>) => void} */
  itemSelectHandler = (item, evt) => {
    const {onItemSelect} = this.props;
    typeof onItemSelect === "function" && onItemSelect(item, evt);
  }

  tagRemoveHandler = (_, index) => {
    const {onItemRemove, selectedItems} = this.props;
    typeof onItemRemove === "function" && onItemRemove(selectedItems[index], index);
  }

  render() {
    const {options, loading, selectedItems} = this.props;
    const itemsToDisplay = this.baseListComposer(options);

    const tagInputProps = {
      onRemove: this.tagRemoveHandler,
      rightElement: loading ? (
        <Spinner size={Spinner.SIZE_SMALL} intent={Intent.PRIMARY} />
      ) : selectedItems.length > 0 ? (
        <Button icon="cross" minimal={true} onClick={this.clearHandler} />
      ) : (
        undefined
      ),
      tagProps: {minimal: true}
    };

    const optionMap = keyBy(options, m => m.key);

    return (
      <MultiSelect
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
        resetOnSelect={true}
        selectedItems={selectedItems.map(key => optionMap[key])}
        tagInputProps={tagInputProps}
        tagRenderer={this.renderTag}
      />
    );
  }

  /** @type {import("@blueprintjs/select").ItemListRenderer<MemberItem>} */
  renderItemList = itemListProps => {
    const {maxDepth} = this.props;

    return itemListProps.query ? (
      <VirtualListRenderer
        {...itemListProps}
        itemRenderer={this.renderItem}
        onItemSelect={this.itemSelectHandler}
      />
    ) : (
      <CategoryListRenderer
        {...itemListProps}
        itemListComposer={this.categoryListComposer}
        maxDepth={maxDepth}
      />
    );
  };

  /** @type {import("@blueprintjs/select").ItemRenderer<MemberItem | MemberOptgroup>} */
  renderItem = (item, {handleClick, index, modifiers, query}) => {
    if ("isOptgroup" in item) {
      return (
        <MenuDivider
          className="member-select optgroup"
          key={item.caption}
          title={item.caption}
        />
      );
    }

    return (
      <MenuItem
        className={classNames("member-select option", {active: modifiers.active})}
        disabled={modifiers.disabled}
        key={item.key}
        onClick={handleClick}
        text={item.name}
      />
    );
  };

  /** @type {(item: MemberItem) => React.ReactNode} */
  renderTag(item) {
    return item.name;
  }
}

/** @type {(member: MemberItem, maxDepth: number, depth: number) => MemberItem} */
const getAncestor = (member, maxDepth, depth) => {
  const ancestors = member.ancestors || [];
  return ancestors[maxDepth - 1 - depth];
};

export default MemberSelect;
