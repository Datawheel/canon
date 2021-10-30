import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";

import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "./Hero.css";

/**
 *
 */
function Hero({section}) {

  /* redux */
  const {localeDefault} = useSelector(state => ({
    localeDefault: state.cms.status.localeDefault
  }));

  /* mount */
  useEffect(() => {
    // todo1.0 load background images
    // todo1.0 reimplement titlesearch click
  }, []);

  const {title} = section.contentByLocale[localeDefault].content;

  return (
    <div className="cms-hero">
      <h1>{title}</h1>
    </div>
  );

}

export default Hero;
