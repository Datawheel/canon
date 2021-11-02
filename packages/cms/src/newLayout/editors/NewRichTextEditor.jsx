import React, {useState} from "react";
import {useSelector} from "react-redux";
import {Button, Intent} from "@blueprintjs/core";

import DraftWrapper from "../../components/editors/DraftWrapper";

import {BLOCK_FIELDS} from "../../utils/consts/cms";

import "./NewRichTextEditor.css";

/**
 *
 */
function NewRichTextEditor({locale, block, fields}) {

  /* redux */
  const {showToolbar} = useSelector(state => ({
    showToolbar: state.cms.status.showToolbar
  }));

  const handleEditor = field => {

  };

  console.log(fields);

  const content = block.contentByLocale[locale].content;

  return (
    <div className="cms-new-rich-text-editor">
      {fields.map(field =>
        <div className="cms-field-container" key={field}>
          <label key="l" htmlFor={field}>
            {field}
          </label>
          <DraftWrapper
            id={field}
            key="dw"
            selectors={[]}
            formatters={[]}
            variables={{}}
            defaultValue={content[field] || ""}
            onChange={() => handleEditor(field)}
            showToolbar={showToolbar}
            // ref={c => this.editors[f] = c}
          />
        </div>
      )}
    </div>
  );

}

export default NewRichTextEditor;
