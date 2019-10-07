import {Button, Intent} from "@blueprintjs/core";
import memoizeOne from "memoize-one";
import React, {Component} from "react";
import {firstTruthy} from "../helpers/booleans";
import {composePropertyName, levelNameFormatter} from "../helpers/formatting";
import {structGroup} from "../helpers/structs";
import MemberSelect from "./MemberSelect";
import LevelSelect from "./SelectorLevel";

/**
 * @typedef OwnProps
 * @property {string} identifier
 * @property {string} labelActionApply
 * @property {string} labelActionDelete
 * @property {string} labelActionEdit
 * @property {string} labelActionReset
 * @property {(groupItem: Pick<GroupItem, "key">) => void} onDelete
 * @property {(groupItem: GroupItem) => void} onUpdate
 * @property {(drillable: LevelItem) => Promise<MemberItem[]>} onMembersNeeded
 */

/**
 * @typedef OwnState
 * @property {boolean} isOpen
 * @property {string} [nextDimension]
 * @property {string} [nextHierarchy]
 * @property {string} [nextLevel]
 * @property {string[]} [nextMembers]
 * @property {string?} error
 * @property {MemberItem[]?} memberList
 */

/** @extends {Component<GroupItem&OwnProps,OwnState>} */
class GroupItemControl extends Component {
  static defaultProps = {};

  /** @type {OwnState} */
  state = {
    isOpen: true,
    error: null,
    memberList: null
  };

  selectMappedMembers = memoizeOne(
    /**
   * @param {string[]} members
   * @param {MemberItem[]?} memberList
   */
    (members, memberList) => {
      memberList = memberList || [];
      const hydratedMembers = [];
      let m = memberList.length;
      while (m--) {
        const member = memberList[m];
        members.includes(`${member.key}`) && hydratedMembers.push(member);
      }
      return hydratedMembers;
    }
  );

  deleteHandler = () => {
    const {onDelete, identifier} = this.props;
    typeof onDelete === "function" && onDelete({key: identifier});
  };

  editHandler = () => this.setState({isOpen: true});

  resetHandler = () =>
    this.setState({
      isOpen: false,
      nextDimension: undefined,
      nextHierarchy: undefined,
      nextLevel: undefined,
      nextMembers: undefined
    });

  updateHandler = () => {
    const {props, state} = this;

    typeof props.onUpdate === "function" &&
      props.onUpdate(
        structGroup({
          key: props.identifier,
          dimension: firstTruthy(state.nextDimension, props.dimension),
          hierarchy: firstTruthy(state.nextHierarchy, props.hierarchy),
          level: firstTruthy(state.nextLevel, props.level),
          members: firstTruthy(state.nextMembers, props.members)
        })
      );

    this.setState({isOpen: false});
  };

  addMemberHandler = member =>
    this.setState(state => ({nextMembers: (state.nextMembers || []).concat(member)}));

  clearMembersHandler = () => this.setState({nextMembers: []});

  removeMemberHandler = memberName =>
    this.setState(state => ({
      nextMembers: (state.nextMembers || []).filter(member => member.name === memberName)
    }));

  /** @param {LevelItem} level */
  setDrillableHandler = level => {
    const {props, state} = this;

    const prevDimension = firstTruthy(state.nextDimension, props.dimension);
    const prevHierarchy = firstTruthy(state.nextHierarchy, props.hierarchy);
    const prevLevel = firstTruthy(state.nextLevel, props.level);

    const {dimension: nextDimension, hierarchy: nextHierarchy, name: nextLevel} = level;

    /** @type {OwnState} */
    const nextState = {
      isOpen: true,
      error: null,
      memberList: null,
      nextDimension,
      nextHierarchy,
      nextLevel,
      nextMembers: []
    };

    if (
      prevDimension === nextDimension &&
      prevHierarchy === nextHierarchy &&
      prevLevel === nextLevel
    ) {
      nextState.nextMembers = firstTruthy(state.nextMembers, props.members) || [];
    }

    this.setState(nextState, () =>
      this.props.onMembersNeeded(level).then(memberList => {
        this.setState({memberList, nextMembers: []});
      })
    );
  };

  /** @param {string[]} nextMembers */
  setMembersHandler = nextMembers => this.setState({nextMembers});

  componentDidMount() {
    const {dimension, hierarchy, level} = this.props;
    this.setDrillableHandler({dimension, hierarchy, name: level});
  }

  render() {
    const {level} = this.props;
    return !level || this.state.isOpen
      ? this.renderEditable.call(this)
      : this.renderClosed.call(this);
  }

  renderClosed() {
    const {dimension, hierarchy, level, members} = this.props;
    const mappedMembers = this.selectMappedMembers(members, this.state.memberList);

    return (
      <div className="grouping-item">
        <div className="group values">
          <div className="grouping-name">
            {levelNameFormatter(dimension, hierarchy, level)}
          </div>
          {mappedMembers.length > 0 && (
            <div className="group grouping-members">
              {mappedMembers.map(member => <span key={member.key}>{member.name}</span>)}
            </div>
          )}
        </div>
        <div className="group actions">
          <Button
            className="action-delete"
            onClick={this.deleteHandler}
            small
            text="Delete"
          />
          <Button
            className="action-edit"
            intent={Intent.PRIMARY}
            onClick={this.editHandler}
            small
            text="Edit"
          />
        </div>
      </div>
    );
  }

  renderEditable() {
    const {
      dimension: prevDimension,
      hierarchy: prevHierarchy,
      labelActionApply,
      labelActionDelete,
      labelActionReset,
      level: prevLevel,
      members: prevMembers
    } = this.props;
    const {nextDimension, nextHierarchy, nextLevel, nextMembers, memberList} = this.state;

    const dimension = firstTruthy(nextDimension, prevDimension);
    const hierarchy = firstTruthy(nextHierarchy, prevHierarchy);
    const level = firstTruthy(nextLevel, prevLevel);

    const members = firstTruthy(nextMembers, prevMembers) || [];
    const mappedMembers = this.selectMappedMembers(members, memberList);

    return (
      <fieldset className="group-item edit">
        <div className="group group-level">
          {/* <LevelSelect
            className="select-level"
            items={options}
            selectedItem={drillable}
            onItemSelect={this.setDrillableHandler}
          /> */}
        </div>
        <div className="group group-members">
          {/* <MemberSelect
            items={memberList || []}
            loading={loading}
            selectedItems={mappedMembers}
            maxDepth={0}
            onClear={this.clearMembersHandler}
            onItemSelect={this.handleAddMember}
            onItemRemove={this.handleRemoveMember} */}
          />
        </div>
        <div className="group actions">
          <Button
            className={level ? "action-reset" : "action-delete"}
            onClick={level ? this.resetHandler : this.deleteHandler}
            small
            text={level ? labelActionReset : labelActionDelete}
          />
          <Button
            className="action-update"
            intent={Intent.PRIMARY}
            onClick={this.updateHandler}
            small
            text={labelActionApply}
          />
        </div>
      </fieldset>
    );
  }
}

export default GroupItemControl;
