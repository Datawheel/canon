import React, {Component} from "react";
import {EditorState, ContentState, convertFromHTML, RichUtils} from "draft-js";
import Editor from "draft-js-plugins-editor";
import {stateToHTML} from "draft-js-export-html";
import createMentionPlugin, {defaultSuggestionsFilter} from "draft-js-mention-plugin";

import "./DraftWrapper.css";

// import "draft-js-mention-plugin/lib/plugin.css";

/* eslint-disable no-unused-vars */
const Entry = props => {
  const {
    mention,
    theme,
    searchValue,
    isFocused,
    ...parentProps
  } = props;

  return (
    <div {...parentProps}>
      <div className={theme.mentionSuggestionsEntryContainer}>
        <div className={theme.mentionSuggestionsEntryContainerLeft}>
          <div className={theme.mentionSuggestionsEntryText}>
            {props.entryComponentSelector
              ? mention.name.replace(/[\[\]]/g, "")
              : `${mention.name.replace(/[{}]/g, "")}: ${mention.value}`
            }
          </div>
        </div>
      </div>
    </div>
  );
};

class DraftWrapper extends Component {
  constructor(props) {
    super(props);
    this.mentionPlugin = createMentionPlugin({
      mentionTrigger: "{{",
      mentionComponent: mentionProps =>
        <span>{mentionProps.children}</span>
    });
    this.mentionPluginFormatter = createMentionPlugin({
      mentionTrigger: "@",
      mentionComponent: mentionProps =>
        <span>{mentionProps.children}</span>
    });
    this.mentionPluginSelector = createMentionPlugin({
      mentionTrigger: "[[",
      mentionComponent: mentionProps =>
        <span>{mentionProps.children}</span>
    });
    let editorState = EditorState.createEmpty();
    if (this.props.defaultValue && this.props.defaultValue !== "") {
      const blocks = convertFromHTML(this.props.defaultValue);
      editorState = EditorState.createWithContent(ContentState.createFromBlockArray(blocks.contentBlocks, blocks.entityMap));
    }
    const {_genStatus, _matStatus, ...variables} = this.props.variables; // eslint-disable-line no-unused-vars
    const suggestions = Object.keys(variables).map(k => ({
      name: `{{${k}}}`,
      value: this.props.variables[k]
    }));
    const suggestionsFormatter = this.props.formatters.map(f => ({name: f.name}));
    const suggestionsSelector = this.props.selectors.map(s => ({name: `[[${s.name}]]`}));
    this.state = {
      editorState,
      suggestions,
      suggestionsFormatter,
      suggestionsSelector
    };
    this.onChange = editorState => {
      this.setState({editorState});
      const html = stateToHTML(editorState.getCurrentContent());
      if (this.props.onChange) this.props.onChange(html);
    };
    this.onSearchChange = ({value}) => {
      this.setState({
        suggestions: defaultSuggestionsFilter(value, suggestions)
      });
    };
    this.onSearchChangeFormatter = ({value}) => {
      this.setState({
        suggestionsFormatter: defaultSuggestionsFilter(value, suggestionsFormatter)
      });
    };
    this.onSearchChangeSelector = ({value}) => {
      this.setState({
        suggestionsSelector: defaultSuggestionsFilter(value, suggestionsSelector)
      });
    };
    this.focus = () => {
      this.editor.focus();
    };
    this.handleKeyCommand = (command, editorState) => {
      const newState = RichUtils.handleKeyCommand(editorState, command);
      if (newState) {
        this.onChange(newState);
        return "handled";
      }
      return "not-handled";
    };
  }

  render() {
    const MentionSuggestions = this.mentionPlugin.MentionSuggestions;
    const MentionSuggestionsFormatter = this.mentionPluginFormatter.MentionSuggestions;
    const MentionSuggestionsSelector = this.mentionPluginSelector.MentionSuggestions;
    const plugins = [this.mentionPlugin, this.mentionPluginFormatter, this.mentionPluginSelector];

    return (
      <div className="draft-editor" onClick={this.focus}>
        <Editor
          editorState={this.state.editorState}
          handleKeyCommand={this.handleKeyCommand}
          onChange={this.onChange}
          plugins={plugins}
          ref={c => this.editor = c}
          key="draft-editor"
        />
        <MentionSuggestions
          entryComponent={Entry}
          onAddMention={this.onAddMention}
          onSearchChange={this.onSearchChange}
          suggestions={this.state.suggestions}
          key="mentions"
        />
        <MentionSuggestionsFormatter
          onAddMention={this.onAddMention}
          onSearchChange={this.onSearchChangeFormatter}
          suggestions={this.state.suggestionsFormatter}
          key="mentionsFormatter"
        />
        <MentionSuggestionsSelector
          entryComponent={Entry}
          entryComponentSelector
          onAddMention={this.onAddMention}
          onSearchChange={this.onSearchChangeSelector}
          suggestions={this.state.suggestionsSelector}
          key="mentionsSelector"
        />
      </div>
    );
  }
}

export default DraftWrapper;
