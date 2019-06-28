import {Button, Classes, Icon, Menu, Text} from "@blueprintjs/core";
import classnames from "classnames";
import React from "react";

import "./CategoryListRenderer.css";

class CategoryListRenderer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      stack: []
    };

    this.stackPush = item =>
      this.setState(state => ({stack: [].concat(state.stack, item)}));

    this.stackPop = () =>
      this.setState(state => {
        const stack = state.stack.slice();
        stack.pop();
        return {stack};
      });
  }

  render() {
    const {
      className,
      headerRenderer = this.renderHeader,
      itemListComposer,
      items,
      itemsParentRef,
      maxDepth,
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
      <div className={classnames("catlist-wrapper", `depth-${depth}`, className)}>
        {headerRenderer && headerRenderer(stack, this.stackPop)}
        <Menu className="catlist-content" ulRef={itemsParentRef}>
          {itemsToDisplay.map(itemRenderer, this)}
        </Menu>
      </div>
    );
  }

  renderHeader(stack, backHandler) {
    return (
      <div className="catlist-header">
        <div className="catlist-title">
          {stack.map(item => <span className="title-token">{item}</span>)}
        </div>
        <Button small={true} icon="circle-arrow-left" onClick={backHandler} text="Back" />
      </div>
    );
  }

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
