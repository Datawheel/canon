/* eslint-disable func-style */
import React from "react";
import {withNamespaces} from "react-i18next";
import {sortNumericsOrStrings} from "../helpers/sort";
import LevelSelect from "./LevelSelect";
import MemberSelect from "./MemberSelect";

/**
 * @typedef OwnProps
 * @property {string} dimension
 * @property {string[]} dimensionNames
 * @property {string} hash
 * @property {LevelItem[]} levelOptions
 * @property {boolean} loadingMembers
 * @property {MemberItem[]} memberOptions
 * @property {string[]} members
 * @property {(drillable: LevelItem) => void} onDrillableUpdate
 * @property {(members: string[]) => void} onMembersUpdate
 */

/** @type {React.FC<import("react-i18next").WithNamespaces & OwnProps>} */
const EditGroupItem = ({
  dimension,
  dimensionNames,
  children,
  hash,
  levelOptions,
  loadingMembers,
  memberOptions,
  members,
  onDelete,
  onDrillableUpdate,
  onMembersUpdate,
  t
}) => {
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
          items={freeLevels}
          onItemSelect={onDrillableUpdate}
          placeholder={t("Vizbuilber.placeholder_select")}
          selectedItem={selectedLevel}
        />
      </div>

      <div className="group group-members">
        {/* <label>{t("Show only")}</label> */}
        <MemberSelect
          items={memberOptions}
          loading={loadingMembers}
          maxDepth={0}
          onClear={onMembersClear}
          onItemRemove={onMembersRemove}
          onItemSelect={onMembersAdd}
          selectedItems={members}
        />
      </div>

      {children}
    </fieldset>
  );
};

export default withNamespaces()(EditGroupItem);
