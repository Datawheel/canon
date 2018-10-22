import React from "react";
import classnames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";

import {Spinner} from "@blueprintjs/core";
import {MultiSelect} from "@blueprintjs/labs";

const spinner = <Spinner className="pt-small" />;

function MemberSelect(props) {
  props.className = classnames("select-wrapper select-member", props.className);
  props.tagInputProps.onRemove = props.onItemRemove;
  props.tagInputProps.rightElement = props.loading ? spinner : null;
  return React.createElement(MultiSelect, props);
}

MemberSelect.defaultProps = {
  itemListPredicate(query, items) {
    query = query.trim();
    query = escapeRegExp(query);
    query = query.replace(/\s+/g, ".+");
    const tester = RegExp(query || ".", "i");
    return items.filter(item => tester.test(item.caption || item.name));
  },
  itemRenderer({handleClick, item, isActive}) {
    return (
      <li
        className={classnames("select-item", "select-option", {active: isActive})}
        onClick={handleClick}
      >
        <span className="select-value">{item.caption}</span>
      </li>
    );
  },
  tagRenderer: item => item.caption,
  popoverProps: {
    inline: true,
    popoverClassName: "select-popover pt-minimal"
  },
  resetOnSelect: true,
  tagInputProps: {}
};

export default MemberSelect;
