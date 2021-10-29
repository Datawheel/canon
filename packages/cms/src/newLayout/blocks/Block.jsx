import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";

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
    <div >
      i'm a block
    </div>
  );

}

export default Block;
