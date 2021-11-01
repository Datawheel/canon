import React, {useState} from "react";
import {Button} from "@blueprintjs/core";

import SettingsCog from "../SettingsCog";
import CogMenu from "../components/CogMenu";

import {ENTITY_TYPES} from "../../utils/consts/cms";

import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "./SectionHeader.css";

/**
 *
 */
function SectionHeader({section, dragHandleProps}) {

  /* state */

  return (
    <div className="cms-section-header">
      <Button key="b1" small={true} className="cms-section-drag-button" icon="drag-handle-horizontal" {...dragHandleProps}/>
      <span className="cms-section-header-slug">#{section.slug}</span>
      <Button key="b2" small={true} className="cms-section-edit-button" icon="edit" />
      <SettingsCog
        content={<CogMenu type={ENTITY_TYPES.SECTION} id={section.id}/>}
        renderTarget={props => <Button {...props} key="b3" className="cms-section-cog-button" small={true} icon="cog" />}
      />
    </div>
  );

}

export default SectionHeader;
