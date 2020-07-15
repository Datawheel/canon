import {Button, Classes, Icon, Menu, Text} from "@blueprintjs/core";
import classNames from "classnames";
import React, {Component} from "react";

/**
 * @template T
 * @typedef OwnProps
 * @property {(stack: string[], items: T[], maxDepth: number) => string[] | T[]} itemListComposer
 * @property {number} maxDepth
 * @property {string} [className]
 * @property {(stack: string[], backHandler: (event: React.MouseEvent<HTMLElement>) => void) => JSX.Element} [headerRenderer]
 */

/**
 * @typedef OwnState
 * @property {string[]} stack
 */

/**
 * @template T
 * @extends {Component<import("@blueprintjs/select").IItemListRendererProps<T>&OwnProps<T>, OwnState>}
 */
class CategoryListRenderer extends Component {
  state = {
    stack: []
  };

  stackPush = item => this.setState(state => ({stack: state.stack.concat(item)}));

  stackPop = () =>
    this.setState(({stack}) => ({stack: stack.slice(0, stack.length - 1)}));

  render() {
    const {
      // activeItem,
      className,
      // filteredItems,
      headerRenderer = this.renderHeader,
      itemListComposer,
      items,
      itemsParentRef,
      maxDepth,
      // query,
      renderItem
    } = this.props;

    const {stack} = this.state;

    if (!itemListComposer) {
      throw new Error(
        "An itemListComposer function is required for categorized ListView."
      );
    }

    const depth = stack.length;
    const itemRenderer = depth === maxDepth ? renderItem : this.renderMenuItem;
    const itemsToDisplay = itemListComposer(stack, items, maxDepth);

    if (
      depth < maxDepth &&
      itemsToDisplay.length > 0 &&
      typeof itemsToDisplay[0] !== "string"
    ) {
      throw new Error(
        "The itemListComposer function must return strings if depth < maxDepth."
      );
    }

    return (
      <div className={classNames("catlist-wrapper", `depth-${depth}`, className)}>
        {typeof headerRenderer === "function" && headerRenderer(stack, this.stackPop)}
        <Menu className="catlist-content" ulRef={itemsParentRef}>
          {itemsToDisplay.map(itemRenderer, this)}
        </Menu>
      </div>
    );
  }

  /**
   * @param {string[]} stack
   * @param {(event: React.MouseEvent<HTMLElement>) => void} [backHandler]
   */
  renderHeader(stack, backHandler) {
    return (
      <div className="catlist-header">
        <div className="catlist-title">
          {stack.map(item => <span key={item} className="title-token">{item}</span>)}
        </div>
        <Button small={true} icon="circle-arrow-left" onClick={backHandler} text="Back" />
      </div>
    );
  }

  /** @param {string} item */
  renderMenuItem(item) {
    // this should mimic the output of
    // <MenuItem onclick={} text={item} shouldDismissPopover={false} />
    return (
      <li key={item}>
        <a onClick={this.stackPush.bind(this, item)} className={Classes.MENU_ITEM}>
          {/* <Icon icon={icon} /> */}
          <Text className={Classes.FILL} ellipsize={!this.props.multiline}>
            {item}
          </Text>
          <Icon icon="caret-right" />
        </a>
      </li>
    );
  }
}

export default CategoryListRenderer;
