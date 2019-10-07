import React from "react";
import classNames from "classnames";
import {connect} from "react-redux";
import {doGroupCreate, doGroupDelete, doGroupUpdate} from "../actions/query";
import {structGroup} from "../helpers/structs";
import {selectGroups} from "../selectors/queryRaw";
import GroupControl from "./ControlGroupItem";
import {doFetchMembers} from "../actions/olap";

/**
 * @typedef OwnProps
 * @property {string} [className]
 * @property {string} labelActionAdd
 * @property {string} labelActionApply
 * @property {string} labelActionDelete
 * @property {string} labelActionEdit
 * @property {string} labelActionReset
 * @property {string} labelTitle
 */

/**
 * @typedef StateProps
 * @property {GroupItem[]} groups
 */

/**
 * @typedef DispatchProps
 * @property {() => void} groupCreateHandler
 * @property {(groupItem: GroupItem) => void} groupDeleteHandler
 * @property {(groupItem: GroupItem) => void} groupUpdateHandler
 * @property {(drillable: LevelItem) => Promise<MemberItem[]>} fetchMembersHandler
 */

/** @type {React.FC<OwnProps&StateProps&DispatchProps>} */
const GroupsManager = function({
  className,
  fetchMembersHandler,
  groupCreateHandler,
  groupDeleteHandler,
  groups,
  groupUpdateHandler,
  labelActionAdd,
  labelActionApply,
  labelActionDelete,
  labelActionEdit,
  labelActionReset,
  labelTitle,
}) {
  return (
    <fieldset className={className}>
      <legend className="label">{labelTitle}</legend>
      <div className="grouping-items">
        {groups.map(group => (
          <GroupControl
            dimension={group.dimension}
            hierarchy={group.hierarchy}
            level={group.level}
            identifier={group.key}
            key={group.key}
            labelActionApply={labelActionApply}
            labelActionDelete={labelActionDelete}
            labelActionEdit={labelActionEdit}
            labelActionReset={labelActionReset}
            members={group.members}
            onDelete={groupDeleteHandler}
            onMembersNeeded={fetchMembersHandler}
            onUpdate={groupUpdateHandler}
          />
        ))}
      </div>
      <button className="action-add" onClick={groupCreateHandler}>
        {labelActionAdd}
      </button>
    </fieldset>
  );
};

/** @type {import("react-redux").MapStateToProps<StateProps,OwnProps,GeneralState>} */
function mapState(state) {
  return {
    groups: selectGroups(state)
  };
}

/** @type {import("react-redux").MapDispatchToPropsFunction<DispatchProps,OwnProps>} */
function mapDispatch(dispatch) {
  return {
    groupCreateHandler() {
      dispatch(doGroupCreate(structGroup({})));
    },
    groupDeleteHandler(groupItem) {
      dispatch(doGroupDelete(groupItem));
      // dispatch(doRunQuery());
    },
    groupUpdateHandler(groupItem) {
      dispatch(doGroupUpdate(groupItem));
      // dispatch(doRunQuery());
    },
    fetchMembersHandler(drillable) {
      return dispatch(doFetchMembers(drillable));
    }
  };
}

export default connect(mapState, mapDispatch)(GroupsManager);
