/* eslint-disable func-style */
import {Button, Classes, Icon, Menu, Text} from "@blueprintjs/core";
import React, {Fragment, useMemo, useState} from "react";
import {group} from "../helpers/rollup";

/**
 * @template T
 * @typedef OwnProps
 * @property {string[]} [initialStack]
 * @property {((d: T, i: number, dl: T[]) => string)[]} levels
 * @property {boolean} [multiline]
 */

/**
 * @template T
 * @type {React.FC<import("@blueprintjs/select").IItemListRendererProps<T> & OwnProps<T>>}
 */
const NavigationList = function({
  initialStack = [],
  items,
  levels = [],
  multiline = true,
  renderItem
}) {
  const hierarchy = useMemo(() => group(items, ...levels), [items, levels]);
  const [stack, setStack] = useState(initialStack);

  const pushCategory = (parent, childMap) => {
    const nextStack = stack.concat(parent);
    if (!Array.isArray(childMap) && childMap.size === 1) {
      childMap.forEach((_, key) => nextStack.push(key));
    }
    setStack(nextStack);
  };

  const popCategory = () => {
    const nextStack = stack.slice(0, stack.length - 1);
    const childMap = nextStack.reduce((map, layer) => map.get(layer), hierarchy);
    if (childMap.size === 1) {
      nextStack.pop();
    }
    setStack(nextStack);
  };

  const headerTokens = stack
    .filter((token, index, stack) => stack.indexOf(token) === index)
    .map((token, index) =>
      <span key={token} className={`hierarchy-list-token level-${index}`}>
        {token}
      </span>
    );

  const categories = stack.reduce((map, layer) => map.get(layer), hierarchy);

  const listElements = Array.isArray(categories)
    ? categories.map((item, index) => <li key={index}>{renderItem(item, index)}</li>)
    : Array.from(categories, ([parent, childMap]) =>
      <li key={parent}>
        <a onClick={() => pushCategory(parent, childMap)} className={Classes.MENU_ITEM}>
          <Text className={Classes.FILL} ellipsize={!multiline}>
            {parent}
          </Text>
          <Icon icon="caret-right" />
        </a>
      </li>
    );

  return (
    <Fragment>
      {stack.length > 0 &&
        <div className="hierarchy-list-header">
          <Button icon="arrow-left" onClick={popCategory} />
          <div className="hierarchy-list-header-tokens">{headerTokens}</div>
        </div>
      }
      <Menu className="hierarchy-list-content">{listElements}</Menu>
    </Fragment>
  );
};

export default NavigationList;
