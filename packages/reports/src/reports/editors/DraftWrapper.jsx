import React, {useCallback, useMemo, useRef, useState} from "react";
import {EditorState, ContentState, convertFromHTML, RichUtils} from "draft-js";
import Editor from "@draft-js-plugins/editor";
import {stateToHTML} from "draft-js-export-html";
import createMentionPlugin, {defaultSuggestionsFilter} from "@draft-js-plugins/mention";
import createToolbarPlugin from "@draft-js-plugins/static-toolbar";
import createToolbarLinkPlugin from "draft-js-toolbar-link-plugin";
import customLinkifyPlugin from "./customLinkifyPlugin";

import {
  ItalicButton,
  BoldButton,
  UnderlineButton,
  CodeButton,
  UnorderedListButton,
  OrderedListButton,
  BlockquoteButton,
  CodeBlockButton
} from "@draft-js-plugins/buttons";


import DraftEntry from "./DraftEntry";
import "./DraftWrapper.css";
import "@draft-js-plugins/mention/lib/plugin.css";
import "@draft-js-plugins/static-toolbar/lib/plugin.css";

/** */
function DraftWrapper({defaultValue, variables, formatters, onChange, showToolbar, onDirty}) {

  const ref = useRef();

  const [editorState, setEditorState] = useState(() => {
    let editorState = EditorState.createEmpty();
    if (defaultValue && defaultValue !== "") {
      const blocks = convertFromHTML(defaultValue);
      editorState = EditorState.createWithContent(ContentState.createFromBlockArray(blocks.contentBlocks, blocks.entityMap));
    }
    return editorState;
  });

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const onSearchChange = ({value}) => setValue(value);
  const onOpenChange = useCallback(open => setOpen(open), []);

  const [openFormatter, setOpenFormatter] = useState(false);
  const [valueFormatter, setValueFormatter] = useState("");
  const onSearchChangeFormatter = ({value}) => setValueFormatter(value);
  const onOpenChangeFormatter = useCallback(open => setOpenFormatter(open), []);

  const suggestions = useMemo(() => {
    const suggestions = Object.keys(variables).map(k => ({
      name: `{{${k}}}`,
      value: variables[k]
    }));
    return defaultSuggestionsFilter(value, suggestions);
  }, [variables, value]);

  const suggestionsFormatter = useMemo(() => {
    const suggestionsFormatter = formatters.map(f => ({name: f.name}));
    return defaultSuggestionsFilter(valueFormatter, suggestionsFormatter);
  }, [formatters, valueFormatter]);

  const {MentionSuggestions, MentionSuggestionsFormatter, Toolbar, LinkButton, plugins} = useMemo(() => {
    const mentionPlugin = createMentionPlugin({
      mentionTrigger: "{{",
      mentionComponent(mentionProps) {
        return <span className="cms-variable-draft-trigger cms-draft-trigger">
          {mentionProps.children}
        </span>;
      }
    });
    const {MentionSuggestions} = mentionPlugin;
    const mentionPluginFormatter = createMentionPlugin({
      mentionTrigger: "@",
      mentionComponent(mentionProps) {
        return <span className="cms-formatter-draft-trigger cms-draft-trigger">
          {mentionProps.children}
        </span>;
      }
    });
    const {MentionSuggestions: MentionSuggestionsFormatter} = mentionPluginFormatter;
    const staticToolbarPlugin = createToolbarPlugin();
    const {Toolbar} = staticToolbarPlugin;
    const linkPlugin = createToolbarLinkPlugin();
    const {LinkButton} = linkPlugin;
    const plugins = [mentionPlugin, mentionPluginFormatter, staticToolbarPlugin, customLinkifyPlugin];
    return {MentionSuggestions, MentionSuggestionsFormatter, Toolbar, LinkButton, plugins};
  }, []);

  const onChangeLocal = useCallback(editorState => {
    setEditorState(editorState);
    const text = stateToHTML(editorState.getCurrentContent());
    if (onChange) onChange(text);
  }, []);

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      onChangeLocal(newState);
      return "handled";
    }
    return "not-handled";
  };

  const keyBindingFn = () => {
    if (onDirty) onDirty();
  };

  /*
    this.reload = () => {
      if (defaultValue && defaultValue !== "") {
        let editorState = EditorState.createEmpty();
        const blocks = convertFromHTML(this.props.defaultValue);
        editorState = EditorState.createWithContent(ContentState.createFromBlockArray(blocks.contentBlocks, blocks.entityMap));
        this.setState({editorState});
      }
    };
  */

  return (
    <div className="cms-draft-wrapper" onClick={() => ref.current?.focus()}>
      {/* main editor */}
      {showToolbar && <Toolbar>
        {
          externalProps => <div>
            <BoldButton {...externalProps} />
            <ItalicButton {...externalProps} />
            <UnderlineButton {...externalProps} />
            <LinkButton {...externalProps}/>
            <CodeButton {...externalProps} />
            <UnorderedListButton {...externalProps} />
            <OrderedListButton {...externalProps} />
            <BlockquoteButton {...externalProps} />
            <CodeBlockButton {...externalProps} />
          </div>
        }
      </Toolbar>
      }
      <Editor
        editorState={editorState}
        handleKeyCommand={handleKeyCommand}
        keyBindingFn={keyBindingFn}
        onChange={onChangeLocal}
        plugins={plugins}
        ref={ref}
        key="draft-editor"
      />

      <span className="cms-draft-entry cms-variable-draft-entry">
        <MentionSuggestions
          entryComponent={DraftEntry}
          open={open}
          onOpenChange={onOpenChange}
          onSearchChange={onSearchChange}
          suggestions={suggestions}
          key="mentions"
        />
      </span>
      <span className="cms-draft-entry cms-formatter-draft-entry">
        <MentionSuggestionsFormatter
          open={openFormatter}
          onOpenChange={onOpenChangeFormatter}
          onSearchChange={onSearchChangeFormatter}
          suggestions={suggestionsFormatter}
          key="mentionsFormatter"
        />
      </span>
    </div>
  );
}

export default DraftWrapper;
