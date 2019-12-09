import React from "react";
import {withNamespaces} from "react-i18next";
import {sortNumericsOrStrings} from "../helpers/sort";
import LevelSelect from "./LevelSelect";
import MemberSelect from "./MemberSelect";
import MiniButton from "./MiniButton";

/**
 * @typedef OwnProps
 * @property {string} dimension
 * @property {string[]} dimensionNames
 * @property {boolean} dirty
 * @property {string} hash
 * @property {number} index
 * @property {LevelItem[]} levelOptions
 * @property {boolean} loadingMembers
 * @property {MemberItem[]} memberOptions
 * @property {string[]} members
 * @property {() => void} onDelete
 * @property {(drillable: LevelItem) => void} onDrillableUpdate
 * @property {(members: string[]) => void} onMembersUpdate
 * @property {() => void} onReset
 * @property {() => void} onUpdate
 */

/** @type {React.FC<import("react-i18next").WithNamespaces & OwnProps>} */
const EditGroupItem = function EditGroupItem({
  dimension,
  dimensionNames,
  dirty,
  hash,
  index,
  levelOptions,
  loadingMembers,
  memberOptions,
  members,
  onDelete,
  onDrillableUpdate,
  onMembersUpdate,
  onReset,
  onUpdate,
  t
}) {
  const selectedLevel = levelOptions.find(lvl => lvl.hash === hash);

  const freeLevels = levelOptions.filter(
    lvl => lvl.dimension === dimension || !dimensionNames.includes(lvl.dimension)
  );

  const onMembersAdd = member => {
    if (members.indexOf(member.key) === -1) {
      const nextMembers = members.concat(member.key);
      onMembersUpdate(sortNumericsOrStrings(nextMembers));
    }
  };
  const onMembersClear = () => onMembersUpdate([]);
  const onMembersRemove = memberKey =>
    onMembersUpdate(members.filter(key => key !== memberKey));

  return (
    <fieldset className="group-item edit">
      <legend className="group-title">{dimension}</legend>
      <div className="group group-level">
        {/* <label>{t("Divide data by")}</label> */}
        <LevelSelect
          onItemSelect={onDrillableUpdate}
          options={freeLevels}
          selectedItem={selectedLevel}
        />
      </div>

      <div className="group group-members">
        {/* <label>{t("Show only")}</label> */}
        <MemberSelect
          options={memberOptions}
          loading={loadingMembers}
          selectedItems={members}
          maxDepth={0}
          onClear={onMembersClear}
          onItemSelect={onMembersAdd}
          onItemRemove={onMembersRemove}
        />
      </div>

      <div className="group actions">
        {dirty && <MiniButton
          className="action-reset"
          onClick={onReset}
          text={t("Vizbuilder.action_reset")}
        />}
        {!dirty && index > 0 && <MiniButton
          className="action-delete"
          onClick={onDelete}
          text={t("Vizbuilder.action_delete")}
        />}
        <MiniButton
          className="action-update"
          onClick={onUpdate}
          primary
          text={t("Vizbuilder.action_apply")}
        />
      </div>
    </fieldset>
  );
};

export default withNamespaces()(EditGroupItem);
