import React from "react";
import {withNamespaces} from "react-i18next";
import {levelNameFormatter} from "../helpers/format";

/**
 * @typedef OwnProps
 * @property {boolean} combine
 * @property {string} dimension
 * @property {string} hierarchy
 * @property {string} level
 * @property {Record<string, MemberItem>} memberMap
 * @property {string[]} members
 */

/** @type {React.FC<import("react-i18next").WithNamespaces & OwnProps>} */
const ViewGroupItem = ({
  children,
  combine,
  dimension,
  hierarchy,
  level,
  memberMap,
  members,
  t
}) =>
  <fieldset className="group-item edit">
    <legend className="group-title">{dimension}</legend>
    <div className="group values">
      <div className="group-name">
        {levelNameFormatter(dimension, hierarchy, level)}
      </div>
      {combine && <div className="group-iscombined">{t("Vizbuilder.group_iscombined")}</div>}
      <div className="group-members">
        {members.map(key => {
          const member = memberMap[key] || {};
          return <span key={member.key}>{member.name}</span>;
        })}
      </div>
    </div>
    {children}
  </fieldset>;

export default withNamespaces()(ViewGroupItem);
