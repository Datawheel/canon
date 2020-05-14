import keyBy from "lodash/keyBy";
import React, {Component} from "react";
import {withNamespaces} from "react-i18next";
import {connect} from "react-redux";
import GroupItemEdit from "../components/GroupItemEdit";
import GroupItemView from "../components/GroupItemView";
import MiniButton from "../components/MiniButton";
import {structGroup} from "../helpers/structs";
import {doFetchMembers, doRunQueryCore} from "../middleware/actions";
import {doGroupDelete, doGroupUpdate} from "../store/query/actions";
import {
  selectGroupDimensionList,
  selectGroupMap,
  selectLevelListForCube
} from "../store/query/selectors";

/**
 * @typedef OwnProps
 * @property {string} identifier
 * @property {boolean} isOnlyChild
 * @property {boolean} isInitiallyOpen
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
    isOpen: this.props.isInitiallyOpen,
    loadingMembers: false,
    memberMap: {},
    nextDimension: this.props.group.dimension,
    nextHash: this.props.group.hash,
    nextHierarchy: this.props.group.hierarchy,
    nextLevel: this.props.group.level,
    nextMembers: this.props.group.members
  };

  applyHandler = () => {
    const {props, state} = this;
    if (
      props.group.hash !== state.nextHash ||
      `${props.group.members}` !== `${state.nextMembers}`
    ) {
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
    }
    this.resetHandler();
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

  /** @type {(drillable: LevelItem) => void} */
  setDrillableHandler = drillable => {
    if (this.props.group.hash === drillable.hash) return;

    const nextState = {
      isOpen: true,
      error: null,
      memberMap: {},
      nextDimension: drillable.dimension,
      nextHierarchy: drillable.hierarchy,
      nextLevel: drillable.name,
      nextHash: drillable.hash,
      nextMembers: []
    };
    this.setState(nextState, this.refreshMemberList);
  };

  /** @type {(members: string[]) => void} */
  setMembersHandler = members => this.setState({nextMembers: members});

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
    const {props, state} = this;
    const {group, isOnlyChild, t} = props;
    const {isOpen} = state;

    if (isOpen) {
      const isDirty =
        state.nextHash !== group.hash ||
        `${state.nextMembers}` !== `${group.members}`;

      return <GroupItemEdit
        dimension={state.nextDimension}
        dimensionNames={props.dimensionNames}
        hash={state.nextHash}
        levelOptions={props.levels}
        loadingMembers={state.loadingMembers}
        memberOptions={Object.values(state.memberMap)}
        members={state.nextMembers}
        onDelete={this.deleteHandler}
        onDrillableUpdate={this.setDrillableHandler}
        onMembersUpdate={this.setMembersHandler}
      >
        <div className="group actions">
          {isDirty && <MiniButton
            className="action-reset"
            onClick={this.resetHandler}
            text={t("Vizbuilder.action_reset")}
          />}
          {!isOnlyChild && <MiniButton
            className="action-delete"
            onClick={this.deleteHandler}
            text={t("Vizbuilder.action_delete")}
          />}
          <MiniButton
            className="action-update"
            onClick={this.applyHandler}
            primary
            text={t("Vizbuilder.action_apply")}
          />
        </div>
      </GroupItemEdit>;
    }
    else {
      return <GroupItemView
        dimension={group.dimension}
        hierarchy={group.hierarchy}
        level={group.level}
        memberMap={state.memberMap}
        members={group.members}
      >
        <div className="group actions">
          {!isOnlyChild && <MiniButton
            className="action-delete"
            onClick={this.deleteHandler}
            text={t("Vizbuilder.action_delete")}
          />}
          <MiniButton
            className="action-edit"
            primary
            onClick={this.editHandler}
            text={t("Vizbuilder.action_edit")}
          />
        </div>
      </GroupItemView>;
    }
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
    // @ts-ignore
    fetchMembers(drillable) {
      return dispatch(doFetchMembers(drillable));
    },

    onDelete(groupItem) {
      dispatch(doGroupDelete(groupItem));
      dispatch(doRunQueryCore());
    },

    onUpdate(groupItem) {
      dispatch(doGroupUpdate(groupItem));
      dispatch(doRunQueryCore());
    }
  };
}

export default connect(mapState, mapDispatch)(
  withNamespaces()(GroupItemControl)
);
