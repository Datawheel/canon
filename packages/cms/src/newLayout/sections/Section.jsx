import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";

import SectionHeader from "./SectionHeader";
import Block from "../blocks/Block";

import "./Section.css";

/**
 *
 */
function Section({section, isDragging, dragHandleProps}) {

  const dispatch = useDispatch();

  /* redux */
  const {localeDefault} = useSelector(state => ({
    localeDefault: state.cms.status.localeDefault
  }));

  const {blocks} = section;

  return (
    <div className={`cms-section${isDragging ? " isDragging" : ""}`}>
      <SectionHeader section={section} dragHandleProps={dragHandleProps}/>
      <div className="cms-section-content">
        {blocks.map(block =>
          <Block key={`block-${block.id}`} block={block}/>
        )}
      </div>
    </div>
  );

}

export default Section;
