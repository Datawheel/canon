import React from "react";
import {MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight} from "react-icons/md";

export default {
  display: {
    label: "Size",
    defaultValue: "block",
    options: [
      {label: "Full Width", value: "block"},
      {label: "Inline", value: "inline"}
    ]
  },
  align: {
    label: "Alignment",
    defaultValue: "left",
    options: [
      {label: <MdFormatAlignLeft />, value: "left"},
      {label: <MdFormatAlignCenter />, value: "center"},
      {label: <MdFormatAlignRight />, value: "right"}
    ]
  }
};
