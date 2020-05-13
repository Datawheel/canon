import {Button, Checkbox} from "@blueprintjs/core";
import PropTypes from "prop-types";
import React from "react";

import {fetchMembers} from "../../helpers/fetch";
import {composePropertyName} from "../../helpers/formatting";

import LevelSelect from "./LevelSelect";
import MemberSelect from "./MemberSelect";
import SidebarCRUDItem from "./SidebarCRUDItem";

import Grouping from "../../helpers/Grouping";

/**
 * @augments SidebarCRUDItem
 */
class GroupingItem extends SidebarCRUDItem {
  constructor(props) {
    super(props);

    const item = props.item;

    this.state = {
      isOpen: item.new,
      loading: true,
      members: [],
      ancestry: [],
      newItem: !item.level ? item.setLevel(props.options[0]) : null
    };

    this.handleUpdateLevel = this.handleUpdateLevel.bind(this);
    this.handleAddMember = this.handleUpdate.bind(this, "addMember");
    this.handleClearMembers = this.handleUpdate.bind(this, "clearMembers");
    this.handleRemoveMember = this.handleUpdate.bind(this, "removeMember");
    this.handleUpdateCombine = this.handleUpdate.bind(this, "toggleCombine");
  }

  componentDidMount() {
    const activeItem = this.state.newItem || this.props.item;
    this.handleUpdateLevel(activeItem.level);
  }

  render() {
    const {item = {}} = this.props;
    return !item.level || this.state.isOpen
      ? this.renderEditable.call(this)
      : this.renderClosed.call(this);
  }

  renderClosed() {
    const {item} = this.props;
    return (
      <div className="grouping-item">
        <div className="group values">
          <div className="grouping-name">{composePropertyName(item.level)}</div>
          {item.combine && <div className="grouping-iscombined">(Combined values)</div>}
          {item.hasMembers &&
            <div className="group grouping-members">
              {item.members.map(member => <span key={member.key}>{member.name}</span>)}
            </div>
          }
        </div>
        <div className="group actions">
          <Button
            text="Delete"
            className="bp3-small action-delete"
            onClick={this.handleDelete}
          />
          <Button
            text="Edit"
            className="bp3-small bp3-intent-primary action-edit"
            onClick={this.handleEdit}
          />
        </div>
      </div>
    );
  }

  renderEditable() {
    const {item, options} = this.props;
    const {ancestry, loading, members, newItem} = this.state;
    const activeItem = newItem || item;
    return (
      <div className="grouping-item editing">
        <div className="group grouping-level">
          <LevelSelect
            className="select-level"
            items={options}
            activeItem={activeItem.level}
            onItemSelect={this.handleUpdateLevel}
          />
        </div>
        <div className="group grouping-members">
          <MemberSelect
            // activeItem
            items={members}
            loading={loading}
            selectedItems={activeItem.members}
            maxDepth={ancestry.length}
            onClear={this.handleClearMembers}
            onItemSelect={this.handleAddMember}
            onItemRemove={this.handleRemoveMember}
          />
        </div>
        <div className="group grouping-combine">
          <Checkbox
            checked={activeItem.combine}
            label="Combine"
            onChange={this.handleUpdateCombine}
          />
        </div>
        <div className="group actions">
          <Button
            text={item.level ? "Cancel" : "Delete"}
            className="bp3-small action-reset"
            onClick={item.level ? this.handleClose : this.handleDelete}
          />
          <Button
            text="Apply"
            className="bp3-small bp3-intent-primary action-update"
            onClick={this.handleApply}
          />
        </div>
      </div>
    );
  }

  handleUpdateLevel(level) {
    if (!level) return;
    const {query} = this.props;
    const activeItem = this.state.newItem || this.props.item;
    const newItem = activeItem.setLevel(level);
    this.setState({loading: true, members: [], newItem}, () =>
      fetchMembers(query, level).then(members => {
        if (members.length === 0) {
          throw new Error(`Level "${level.name}" doesn't have members.`);
        }
        const {ancestors = []} = members[0] || {};
        const ancestry = ancestors
          .filter(parent => parent.depth > 0)
          .map(parent => parent.level_name);
        this.setState({loading: false, members, ancestry});
      })
    );
  }
}

GroupingItem.propTypes = {
  item: PropTypes.instanceOf(Grouping),
  onDelete: PropTypes.func,
  onUpdate: PropTypes.func,
  options: PropTypes.array
};

/**
 * @typedef IProps
 * @prop {Grouping} item
 * @prop {(grouping: Grouping) => void} onDelete
 * @prop {(grouping: Grouping) => void} onUpdate
 * @prop {Level[]} options
 */

/**
 * @typedef IState
 * @prop {boolean} isOpen
 * @prop {boolean} loading
 * @prop {Member[]} members
 * @prop {Grouping} newItem
 */

export default GroupingItem;
