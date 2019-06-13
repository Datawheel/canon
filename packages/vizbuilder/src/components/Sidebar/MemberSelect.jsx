import React from "react";
import classNames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";

import {Spinner} from "@blueprintjs/core";
import {BaseMultiSelect} from "./CustomSelect";

const spinner = <Spinner className="bp3-small" />;

function MemberSelect(props) {
  props.className = classNames("select-member", props.className);
  props.tagInputProps.rightElement = props.loading ? spinner : null;
  return React.createElement(BaseMultiSelect, props);
}

MemberSelect.defaultProps = {
  ...BaseMultiSelect.defaultProps,
  findIndex: (haystack, needle) => {
    return needle ? haystack.findIndex(item => item.key === needle.key) : -1;
  },
  getItemHeight: () => 26,
  itemListComposer(items) {
    const nope = {ancestors: [{}]};
    return items.reduce((all, member, i, array) => {
      const prevMember = array[i - 1] || nope;
      const prevAncestor = prevMember.ancestors[0] || {};

      const ancestor = member.ancestors[0];
      if (ancestor && ancestor.key !== prevAncestor.key) {
        all.push({
          key: ancestor.key,
          _header: true,
          caption: ancestor.caption
        });
      }

      all.push(member);

      return all;
    }, []);
  },
  itemListPredicate(query, items) {
    query = query.trim();
    query = escapeRegExp(query);
    query = query.replace(/\s+/g, ".+");
    const tester = RegExp(query || ".", "i");
    return items.filter(item => tester.test(item.caption || item.name));
  },
  itemRenderer({handleClick, isActive, item, style}) {
    const props = {key: item.key, style};
    const className = ["select-item", "option-filtermeasure"];
    let child;

    if (item._header) {
      className.push("select-optgroup");
      props.key = `h1~${props.key}`;
      child = (
        <span className="select-value">
          <span className="select-label h1" title={item.caption}>
            {item.caption}
          </span>
        </span>
      );
    }
    else {
      className.push("select-option", "padded");
      props.onClick = handleClick;
      child = (
        <span className="select-value">
          <span className="select-label" title={item.caption}>
            {item.caption}
          </span>
        </span>
      );
    }

    props.className = classNames(className, {active: isActive});
    return React.createElement("div", props, child);
  },
  resetOnSelect: true,
  sticky: "_header",
  tagInputProps: {
    ...BaseMultiSelect.defaultProps.tagInputProps,
    placeholder: "Filter...",
  },
  tagRenderer: item => item.caption
};

export default MemberSelect;
