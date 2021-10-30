import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button} from "@blueprintjs/core";
import {ENTITY_TYPES} from "../../utils/consts/cms";

import SettingsCog from "../SettingsCog";
import CogMenu from "../CogMenu";

import "./Block.css";

/**
 *
 */
function Block({block}) {

  const dispatch = useDispatch();

  /* redux */
  const {localeDefault} = useSelector(state => ({
    localeDefault: state.cms.status.localeDefault
  }));

  /* mount */
  useEffect(() => {
    // todo1.0 load background images
    // todo1.0 reimplement titlesearch click
  }, []);

  return (
    <div className="cms-section-block">
      <div className="cms-section-block-header">{block.type}</div>
      <div className="cms-block-cog">
        <SettingsCog
          content={<CogMenu type={ENTITY_TYPES.BLOCK} id={block.id} />}
          renderTarget={props => <Button {...props} key="b3" className="cms-block-cog-button" small={true} icon="cog" />}
        />
      </div>
    </div>
  );

}

export default Block;
