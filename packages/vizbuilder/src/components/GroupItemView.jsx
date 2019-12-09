import React from "react";
import {withNamespaces} from "react-i18next";
import MiniButton from "./MiniButton";
import {levelNameFormatter} from "../helpers/format";

/**
 * @typedef OwnProps
 * @property {string} dimension
 * @property {string} hierarchy
 * @property {string} level
 * @property {number} index
 * @property {Record<string, MemberItem>} memberMap
 * @property {string[]} members
 * @property {() => void} onDelete
 * @property {() => void} onEdit
 */

/** @type {React.FC<import("react-i18next").WithNamespaces & OwnProps>} */
const ViewGroupItem = function ViewGroupItem({
  dimension,
  hierarchy,
  index,
  level,
  memberMap,
  members,
  onDelete,
  onEdit,
  t
}) {
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
        {index > 0 && <MiniButton
          className="action-delete"
          onClick={onDelete}
          text={t("Vizbuilder.action_delete")}
        />}
        <MiniButton
          className="action-edit"
          primary
          onClick={onEdit}
          text={t("Vizbuilder.action_edit")}
        />
      </div>
    </fieldset>
  );
};

export default withNamespaces()(ViewGroupItem);
