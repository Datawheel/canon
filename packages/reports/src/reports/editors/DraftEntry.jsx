import React from "react";
import "./DraftEntry.css";

/* eslint-disable no-unused-vars */
const DraftEntry = props => {
  const {
    mention,
    searchValue,
    isFocused,
    ...parentProps
  } = props;

  // extra div needed here because reasons
  return (
    <div {...parentProps}>
      {`${mention.name.replace(/[{}]/g, "")}: ${mention.value}`}
    </div>
  );
};

export default DraftEntry;
