import React, {Component} from "react";
import {EditorState, ContentState, convertFromHTML, RichUtils} from "draft-js";
import Editor from "draft-js-plugins-editor";
import {stateToHTML} from "draft-js-export-html";
import createMentionPlugin, {defaultSuggestionsFilter} from "draft-js-mention-plugin";

// import Textarea from "../fields/components/Textarea";
import DraftEntry from "./components/DraftEntry";
import "./DraftWrapper.css";
// import "draft-js-mention-plugin/lib/plugin.css";

class DraftWrapper extends Component {
  constructor(props) {
    super(props);

    // variable block
    this.mentionPlugin = createMentionPlugin({
      mentionTrigger: "{{",
      mentionComponent: mentionProps =>
        <span className="cms-variable-draft-trigger cms-draft-trigger">
          {mentionProps.children}
        </span>
    });
    // formatter block
    this.mentionPluginFormatter = createMentionPlugin({
      mentionTrigger: "@",
      mentionComponent: mentionProps =>
        <span className="cms-formatter-draft-trigger cms-draft-trigger">
          {mentionProps.children}
        </span>
    });
    // selector block
    this.mentionPluginSelector = createMentionPlugin({
      mentionTrigger: "[[",
      mentionComponent: mentionProps =>
        <span className="cms-selector-draft-trigger cms-draft-trigger">
          {mentionProps.children}
        </span>
    });

    let editorState = EditorState.createEmpty();

    if (this.props.defaultValue && this.props.defaultValue !== "") {
      const blocks = convertFromHTML(this.props.defaultValue);
      editorState = EditorState.createWithContent(ContentState.createFromBlockArray(blocks.contentBlocks, blocks.entityMap));
    }

    const {_genStatus, _matStatus, ...variables} = this.props.variables; //eslint-disable-line

    const suggestions = Object.keys(variables).map(k => ({
      name: `{{${k}}}`,
      value: this.props.variables[k]
    }));

    const suggestionsFormatter = this.props.formatters.map(f => ({name: f.name}));
    const suggestionsSelector = this.props.selectors.map(s => ({name: `[[${s.name}]]`, value: s.default}));

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

    // variables
    this.onSearchChange = ({value}) => {
      this.setState({
        suggestions: defaultSuggestionsFilter(value, suggestions)
      });
    };
    // formatters
    this.onSearchChangeFormatter = ({value}) => {
      this.setState({
        suggestionsFormatter: defaultSuggestionsFilter(value, suggestionsFormatter)
      });
    };
    // selectors
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
      <div className="cms-draft-wrapper" onClick={this.focus}>
        {/* main editor */}
        <Editor
          editorState={this.state.editorState}
          handleKeyCommand={this.handleKeyCommand}
          onChange={this.onChange}
          plugins={plugins}
          ref={c => this.editor = c}
          key="draft-editor"
        />

        {/* variables dropdown (generators, materializers) */}
        <span className="cms-draft-entry cms-variable-draft-entry">
          <MentionSuggestions
            entryComponent={DraftEntry}
            onAddMention={this.onAddMention}
            onSearchChange={this.onSearchChange}
            suggestions={this.state.suggestions}
            key="mentions"
          />
        </span>
        {/* formatters dropdown */}
        <span className="cms-draft-entry cms-formatter-draft-entry">
          <MentionSuggestionsFormatter
            onAddMention={this.onAddMention}
            onSearchChange={this.onSearchChangeFormatter}
            suggestions={this.state.suggestionsFormatter}
            key="mentionsFormatter"
          />
        </span>
        {/* selectors dropdown */}
        <span className="cms-draft-entry cms-suggestion-draft-entry">
          <MentionSuggestionsSelector
            entryComponent={DraftEntry}
            entity="selector"
            onAddMention={this.onAddMention}
            onSearchChange={this.onSearchChangeSelector}
            suggestions={this.state.suggestionsSelector}
            key="mentionsSelector"
          />
        </span>
      </div>
    );
  }
}

export default DraftWrapper;
