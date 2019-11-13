import {Button, Intent} from "@blueprintjs/core";
import memoizeOne from "memoize-one";
import React, {Component} from "react";
import keyBy from "lodash/keyBy";
import {withNamespaces} from "react-i18next";
import {connect} from "react-redux";
import LevelSelect from "../components/LevelSelect";
import MemberSelect from "../components/MemberSelect";
import {ensureArray} from "../helpers/arrays";
import {levelNameFormatter} from "../helpers/format";
import {structGroup} from "../helpers/structs";
import {doFetchMembers, doRunQueryCore} from "../middleware/actions";
import {doGroupDelete, doGroupUpdate} from "../store/query/actions";
import {
  selectGroupDimensionList,
  selectGroupMap,
  selectLevelListForCube,
  selectCube
} from "../store/query/selectors";

/**
 * @typedef OwnProps
 * @property {string} identifier
 * @property {number} index
 */

/**
 * @typedef OwnState
 * @property {boolean} isOpen
 * @property {string?} error
 * @property {boolean} loadingMembers
 * @property {Record<string, MemberItem>} memberMap
 * @property {string} [nextDimension]
 * @property {string} [nextHierarchy]
 * @property {string} [nextLevel]
 * @property {string} [nextHash]
 * @property {string[]} [nextMembers]
 */

/**
 * @typedef StateProps
 * @property {string[]} dimensionNames
 * @property {GroupItem} group
 * @property {LevelItem[]} levels
 */

/**
 * @typedef DispatchProps
 * @property {(drillable: LevelRef) => Promise<MemberItem[]>} fetchMembers
 * @property {(groupItem: GroupItem) => void} onDelete
 * @property {(groupItem: GroupItem) => void} onUpdate
 */

/** @extends {Component<import("react-i18next").WithNamespaces & OwnProps & StateProps & DispatchProps, OwnState>} */
class GroupItemControl extends Component {
  state = {
    error: null,
    isOpen: this.props.index > 0,
    loadingMembers: false,
    memberMap: {},
    nextDimension: this.props.group.dimension,
    nextHash: this.props.group.hash,
    nextHierarchy: this.props.group.hierarchy,
    nextLevel: this.props.group.level,
    nextMembers: this.props.group.members
  };

  deleteHandler = () => {
    const props = this.props;
    props.onDelete(props.group);
  };

  editHandler = () => {
    const {group} = this.props;
    this.setState({
      isOpen: true,
      nextDimension: group.dimension,
      nextHash: group.hash,
      nextHierarchy: group.hierarchy,
      nextLevel: group.level,
      nextMembers: group.members
    });
  };

  resetHandler = () =>
    this.setState({
      isOpen: false,
      nextDimension: undefined,
      nextHash: undefined,
      nextHierarchy: undefined,
      nextLevel: undefined,
      nextMembers: undefined
    });

  updateHandler = () => {
    const {props, state} = this;
    props.onUpdate(
      structGroup({
        dimension: state.nextDimension,
        hash: state.nextHash,
        hierarchy: state.nextHierarchy,
        key: props.identifier,
        level: state.nextLevel,
        members: state.nextMembers
      })
    );
    this.resetHandler();
  };

  /** @type {(member: MemberItem) => void} */
  addMemberHandler = member => {
    const key = `${member.key}`;
    if (!ensureArray(this.state.nextMembers).includes(key)) {
      this.setState(state => ({
        nextMembers: ensureArray(state.nextMembers).concat(key)
      }));
    }
  };

  /** @type {() => void} */
  clearMembersHandler = () => this.setState({nextMembers: []});

  /** @type {(memberKey: string, index: number) => void} */
  removeMemberHandler = memberKey =>
    this.setState(state => ({
      nextMembers: ensureArray(state.nextMembers).filter(key => key !== memberKey)
    }));

  refreshMemberList = () =>
    this.setState({loadingMembers: true, memberMap: {}, nextMembers: []}, () => {
      const {state} = this;
      this.props
        .fetchMembers({
          dimension: state.nextDimension,
          hierarchy: state.nextHierarchy,
          level: state.nextLevel
        })
        .then(
          memberList =>
            this.setState({
              loadingMembers: false,
              memberMap: keyBy(memberList, m => m.key)
            }),
          error => this.setState({loadingMembers: false, error: error.message})
        );
    });

  /** @param {LevelLike & {hash: string}} level */
  setDrillableHandler = ({
    dimension: nextDimension,
    hash: nextHash,
    hierarchy: nextHierarchy,
    name: nextLevel
  }) => {
    const {group} = this.props;

    if (group.hash === nextHash) return;

    const nextState = {
      isOpen: true,
      error: null,
      memberMap: {},
      nextDimension,
      nextHierarchy,
      nextLevel,
      nextHash,
      nextMembers: []
    };
    this.setState(nextState, this.refreshMemberList);
  };

  /** @param {string[]} nextMembers */
  setMembersHandler = nextMembers => this.setState({nextMembers});

  canUpdate() {
    const dimensionNames = this.props.dimensionNames.slice();
    const index = dimensionNames.indexOf(this.props.group.dimension);
    dimensionNames.splice(index, 1);
    return dimensionNames.includes(this.state.nextDimension);
  }

  componentDidMount() {
    this.refreshMemberList();
  }

  render() {
    return this.state.isOpen
      ? this.renderEditable.call(this)
      : this.renderClosed.call(this);
  }

  renderClosed() {
    const {t: translate} = this.props;
    const {dimension, hierarchy, level, members} = this.props.group;
    const {memberMap} = this.state;

    return (
      <fieldset className="group-item edit">
        <legend className="group-title">{dimension}</legend>
        <div className="group values">
          <div className="group-name">
            {levelNameFormatter(dimension, hierarchy, level)}
          </div>
          <div className="group-members">
            {members.map(key => {
              const member = memberMap[key] || {};
              return <span key={member.key}>{member.name}</span>;
            })}
          </div>
        </div>
        <div className="group actions">
          <Button
            className="action-delete"
            onClick={this.deleteHandler}
            small
            text={translate("Delete")}
          />
          <Button
            className="action-edit"
            intent={Intent.PRIMARY}
            onClick={this.editHandler}
            small
            text={translate("Edit")}
          />
        </div>
      </fieldset>
    );
  }

  renderEditable() {
    const {props, state} = this;
    const {dimensionNames, levels, t: translate} = props;
    const {nextDimension: dimension, nextHash: hash, nextLevel: level} = state;

    const selectedLevel = levels.find(lvl => lvl.hash === hash);

    const freeLevels = levels.filter(
      lvl => lvl.dimension === dimension || !dimensionNames.includes(lvl.dimension)
    );

    const dirty = hash !== props.group.hash;
    window["translate"] = translate;

    return (
      <fieldset className="group-item edit">
        <legend className="group-title">{dimension}</legend>
        <div className="group group-level">
          <label>{translate("Divide data by")}</label>
          <LevelSelect
            onItemSelect={this.setDrillableHandler}
            options={freeLevels}
            selectedItem={selectedLevel}
          />
        </div>
        <div className="group group-members">
          <label>{translate("Show only")}</label>
          <MemberSelect
            options={Object.values(state.memberMap)}
            loading={state.loadingMembers}
            selectedItems={ensureArray(state.nextMembers)}
            maxDepth={0}
            onClear={this.clearMembersHandler}
            onItemSelect={this.addMemberHandler}
            onItemRemove={this.removeMemberHandler}
          />
        </div>
        <div className="group actions">
          <Button
            className={dirty ? "action-reset" : "action-delete"}
            onClick={dirty ? this.resetHandler : this.deleteHandler}
            small
            text={dirty ? translate("Reset") : translate("Delete")}
          />
          <Button
            className="action-update"
            // disabled={!this.canUpdate()}
            intent={Intent.PRIMARY}
            onClick={this.updateHandler}
            small
            text={translate("Apply")}
          />
        </div>
      </fieldset>
    );
  }
}

/** @type {import("react-redux").MapStateToProps<StateProps, OwnProps, GeneralState>} */
function mapState(state, props) {
  return {
    dimensionNames: selectGroupDimensionList(state),
    group: selectGroupMap(state)[props.identifier],
    levels: selectLevelListForCube(state)
  };
}

/** @type {import("react-redux").MapDispatchToPropsFunction<DispatchProps, OwnProps>} */
function mapDispatch(dispatch) {
  return {
    onDelete(groupItem) {
      dispatch(doGroupDelete(groupItem));
      dispatch(doRunQueryCore());
    },

    onUpdate(groupItem) {
      dispatch(doGroupUpdate(groupItem));
      dispatch(doRunQueryCore());
    },

    // @ts-ignore
    fetchMembers(drillable) {
      return dispatch(doFetchMembers(drillable));
    }
  };
}

export default withNamespaces()(connect(mapState, mapDispatch)(GroupItemControl));
