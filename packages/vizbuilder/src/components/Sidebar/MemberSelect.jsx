import {Button, Intent, MenuDivider, MenuItem, Spinner} from "@blueprintjs/core";
import {MultiSelect} from "@blueprintjs/select";
import classNames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";
import memoizeOne from "memoize-one";
import React from "react";

import CategoryListRenderer from "./CategoryListRenderer";
import VirtualListRenderer from "./VirtualListRenderer";

const getAncestor = (member, maxDepth, depth) => {
  const ancestors = member.ancestors || [];
  return ancestors[maxDepth - 1 - depth] || {};
};

class UpdatedMemberSelect extends React.Component {
  constructor(props) {
    super(props);

    this.clearHandler = this.clearHandler.bind(this);
    this.itemSelectHandler = this.itemSelectHandler.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderItemList = this.renderItemList.bind(this);
    this.tagRemoveHandler = this.tagRemoveHandler.bind(this);

    this.baseListComposer = memoizeOne(items => {
      let lastParentCaption;
      return items.reduce((output, item) => {
        const {caption} = item.ancestors[0];
        if (lastParentCaption !== caption) {
          lastParentCaption = caption;
          output.push({isOptgroup: true, caption});
        }
        output.push(item);
        return output;
      }, []);
    });

    this.categoryListComposer = memoizeOne((stack, items, maxDepth) => {
      const depth = stack.length;
      const isCategoryMember = member =>
        !member.isOptgroup &&
        stack.every(
          (parent, index) => getAncestor(member, maxDepth, index).caption === parent
        );

      if (depth < maxDepth) {
        const parentMap = {};
        let n = items.length;
        while (n--) {
          const member = items[n];
          if (!isCategoryMember(member)) continue;
          const {caption} = getAncestor(member, maxDepth, depth);
          parentMap[caption] = true;
        }
        return Object.keys(parentMap).sort();
      }

      return items.filter(isCategoryMember);
    });
  }

  itemListPredicate(query, items) {
    query = query.trim();
    query = escapeRegExp(query).replace(/\s+/g, "[^_]+");
    const queryTester = RegExp(query || ".", "i");
    return items
      .filter(item => item.isOptgroup || queryTester.test(item.caption))
      .filter(
        (item, index, array) =>
          !item.isOptgroup || (array[index + 1] && !array[index + 1].isOptgroup)
      );
  }

  render() {
    const {activeItem, disabled, items, loading, selectedItems} = this.props;
    const itemsToDisplay = this.baseListComposer(items);

    const popoverProps = {
      boundary: "viewport",
      minimal: true,
      targetTagName: "div",
      wrapperTagName: "div"
    };
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

    return (
      <MultiSelect
        activeItem={activeItem}
        disabled={disabled}
        itemDisabled="isOptgroup"
        itemListPredicate={this.itemListPredicate}
        itemListRenderer={this.renderItemList}
        itemRenderer={this.renderItem}
        items={itemsToDisplay}
        onItemSelect={this.itemSelectHandler}
        popoverProps={popoverProps}
        resetOnSelect={true}
        selectedItems={selectedItems}
        tagInputProps={tagInputProps}
        tagRenderer={this.renderTag}
      />
    );
  }

  /** @param {import("@blueprintjs/select").IItemListRendererProps} itemListProps */
  renderItemList(itemListProps) {
    const {maxDepth} = this.props;

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
          maxDepth={maxDepth}
        />
      );
    }
  }

  renderItem(item, {handleClick, index, modifiers, query}) {
    if (item.isOptgroup) {
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
        text={item.caption}
      />
    );
  }

  renderTag(item) {
    return item.caption;
  }

  clearHandler() {
    const {onClear} = this.props;
    onClear && onClear();
  }

  itemSelectHandler(item, evt) {
    const {onItemSelect} = this.props;
    onItemSelect && onItemSelect(item, evt);
  }

  tagRemoveHandler(_, index) {
    const {onItemRemove, selectedItems} = this.props;
    onItemRemove && onItemRemove(selectedItems[index], index);
  }
}

export default UpdatedMemberSelect;
