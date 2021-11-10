import React, {useState, useEffect} from "react";
import {useSelector} from "react-redux";
import {Button, Intent} from "@blueprintjs/core";

import DraftWrapper from "../../components/editors/DraftWrapper";

import {BLOCK_FIELDS} from "../../utils/consts/cms";
import deepClone from "../../utils/deepClone";

import "./NewRichTextEditor.css";

/**
 *
 */
function NewRichTextEditor({locale, block, fields, onChange, variables}) {

  /* redux */
  const {showToolbar} = useSelector(state => ({
    showToolbar: state.cms.status.showToolbar
  }));

  const [stateContent] = useState(() => deepClone(block.contentByLocale[locale].content));

  const handleEditor = (field, text) => {
    onChange({[field]: text});
  };

  return (
    <div className="cms-new-rich-text-editor">
      {fields.map(field =>
        <div className="cms-field-container" key={field}>
          <label key="label" htmlFor={field}>
            {field}
          </label>
          <DraftWrapper
            id={field}
            key="draft-wrapper"
            selectors={[]}
            formatters={[]}
            variables={variables}
            defaultValue={stateContent[field] || ""}
            onChange={text => handleEditor(field, text)}
            showToolbar={showToolbar}
            // ref={c => this.editors[f] = c}
          />
        </div>
      )}
    </div>
  );

}

export default NewRichTextEditor;
