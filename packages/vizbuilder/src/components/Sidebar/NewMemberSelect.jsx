import React from "react";
import classnames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";

import {Spinner} from "@blueprintjs/core";
import {BaseMultiSelect} from "./CustomSelect";
import DeepList from "./MemberDeepList";
import VirtualList from "./VirtualList";

class NewMemberSelect extends BaseMultiSelect {
  itemListComposer(members) {
    const nope = {ancestors: [{}]};
    const hasQuery = Boolean(this.state.query);

    return members.reduce((all, member, i, array) => {
      const prevMember = array[i - 1] || nope;

      const prevAncestor = prevMember.ancestors[0].name;
      const currAncestor = member.ancestors[0].name;

      if (hasQuery && prevAncestor !== currAncestor) {
        all.push(member.ancestors[0]);
      }

      all.push(member);
      return all;
    }, []);
  }

  rightElement() {
    return this.props.loading ? <Spinner className="pt-small" /> : null
  }

  renderListItem(item, params) {
    if (!item.ancestors) {
      return (
        <li className="virtlist-title" key={item.key} style={params.style}>
          <span className="topic" title={item.caption}>{item.caption}</span>
        </li>
      )
    }

    return (
      <li key={item.key} style={params.style}>
        <button
          tabIndex="0"
          type="button"
          className={classnames("pt-menu-item select-item", {
            "pt-active": params.isActive
          })}
          onClick={params.handleClick}
        >
          <span className="select-label">{item.caption}</span>
        </button>
      </li>
    );
  }

  renderPopover(items) {
    const props = this.props;
    const ListComponent = this.state.query ? VirtualList : DeepList;

    return (
      <div className="select-popover-content">
        <ListComponent
          items={items}
          value={props.value}
          showDimensions={props.showDimensions}
          itemRenderer={this.renderListItem.bind(this)}
          itemMinSize={30}
          height={270}
          onSelect={this.handleItemSelect}
        />
      </div>
    );
  }
}

NewMemberSelect.displayName = "MemberSelect";

NewMemberSelect.defaultProps = {
  ...BaseMultiSelect.defaultProps,
  findIndex: (haystack, needle) => {
    return needle ? haystack.findIndex(item => item.key === needle.key) : -1;
  },
  getItemHeight: () => 24,
  itemListPredicate(query, items) {
    query = query.trim();
    query = escapeRegExp(query);
    query = query.replace(/\s+/g, ".+");
    const tester = RegExp(query || ".", "i");
    return items.filter(item => tester.test(item.caption || item.name));
  },
  resetOnSelect: true,
  sticky: "_header",
  tagInputProps: {
    ...BaseMultiSelect.defaultProps.tagInputProps,
    placeholder: "Filter...",
  },
  tagRenderer: item => item.caption
};

export default NewMemberSelect;
