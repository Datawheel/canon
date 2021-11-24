import React, {useState, useEffect} from "react";
import {useSelector} from "react-redux";

import DraftWrapper from "../../components/editors/DraftWrapper";

import deepClone from "../../utils/deepClone";

import "./NewRichTextEditor.css";

/**
 *
 */
function NewRichTextEditor({locale, block, fields, onChange, variables, setModified}) {

  /* redux */
  const showToolbar = useSelector(state => state.cms.status.showToolbar);

  const [stateContent] = useState(() => deepClone(block.contentByLocale[locale].content));

  /**
   * There is a race condition when this component is mounted with several fields. Each of the fields
   * calls handleEditor on instantiation, which happens too fast for the handler in Block.jsx to merge them.
   * On mount, call onChange *one* time to send up the full object so that the preview can be populated.
   */
  useEffect(() => {
    onChange(stateContent);
  }, []);

  const handleEditor = (field, text) => {
    onChange({[field]: text});
  };

  const keyBindingFn = event => {
    setModified(true);
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
            keyBindingFn={keyBindingFn}
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
