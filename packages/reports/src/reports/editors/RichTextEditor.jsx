/* react */
import React, {useState, useEffect} from "react";
import {useSelector} from "react-redux";
import {titleCase} from "d3plus-text";
import {Text, useMantineTheme} from "@mantine/core";
import {useDebouncedValue} from "@mantine/hooks";

/* components */
import DraftWrapper from "./DraftWrapper";

import sanitizeBlockContent from "../../utils/blocks/sanitizeBlockContent";
import deepClone from "../../utils/js/deepClone";

import {BLOCK_MAP} from "../../utils/consts/cms";

/**
 *
 */
function RichTextEditor({blockType, locale, defaultContent, onChange, variables, onTextModify}) {

  const fields = BLOCK_MAP[blockType];

  /* redux */
  const showToolbar = useSelector(state => state.cms.status.showToolbar);

  /* state */
  const [stateContent, setStateContent] = useState(() => deepClone(defaultContent));

  /**
   * There is a race condition when this component is mounted with several fields. Each of the fields
   * calls handleEditor on instantiation, which happens too fast for the handler in Block.jsx to merge them.
   * On mount, call onChange *one* time to send up the full object so that the preview can be populated.
   */
  useEffect(() => {
    onChange(stateContent, locale);
  }, []);

  /* Update *local* state on each keystroke, but use the debouncer below to space out update callbacks */
  const handleEditor = (field, text) => {
    setStateContent(stateContent => ({...stateContent, [field]: text}));
  };

  /* Rate-limit the slightly expensive state update out in Block.jsx */
  const [debounced] = useDebouncedValue(stateContent, 500);

  useEffect(() => {
    const simple = Object.keys(debounced).reduce((acc, d) => ({...acc, [d]: sanitizeBlockContent(debounced[d])}), {});
    const logic = `return ${JSON.stringify(simple, null, "\t")}`;
    onChange({simple, logic}, locale);
  }, [debounced]);

  /* onChange fires on load - only set the block as "modified" when a true keystroke is entered */
  const onDirty = () => onTextModify(true);

  const theme = useMantineTheme();

  return (
    <table className="cr-rich-text-editor" style={{width: "100%"}}>
      <tbody>
        {fields.map(field =>
          <tr className="cr-field-container" key={field}>
            <td style={{paddingRight: theme.spacing.xs}}>
              <label key="label" htmlFor={field} style={{whiteSpace: "nowrap"}}>
                <Text size="xs" transform="uppercase" weight="bold" color="gray">
                  {titleCase(field)}
                </Text>
              </label>
            </td>
            <td style={{width: "100%"}}>
              <DraftWrapper
                id={field}
                key="draft-wrapper"
                onDirty={onDirty}
                variables={variables}
                defaultValue={stateContent[field] || ""}
                onChange={text => handleEditor(field, text)}
                showToolbar={showToolbar}
              />
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

}

export default RichTextEditor;
