import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {Button} from "@blueprintjs/core";

import "./CMSHeader.css";

/**
 *
 */
function CMSHeader() {

  /* redux */
  const {localeDefault, localeSecondary, locales, profiles} = useSelector(state => ({
    localeDefault: state.cms.status.localeDefault,
    localeSecondary: state.cms.status.localeSecondary,
    locales: state.cms.status.locales,
    // todo1.0 - is this too heavy to import the whole thing?
    profiles: state.cms.profiles
  }));

  const goBack = () => {
    console.log("go back");
  };

  const reportOptions = profiles.map(d => d.contentByLocale[localeDefault].content.label);
  const previewOptions = ["Massachusetts", "New York", "California"];
  const localeOptions = [localeDefault].concat(locales);

  return (
    <div className="cms-header">
      <span className="cms-header-return-link" onClick={goBack}>{"<="}Choose another Profile</span>
      <span>Viewing Automated Report
        <select>
          {reportOptions.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <Button icon="cog" small={true} /></span>
      <span>Previewing as
        <select>
          {previewOptions.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select>
          {localeOptions.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </span>
    </div>
  );

}

export default CMSHeader;
