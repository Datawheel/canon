import React, {Component} from "react";
import {EditorState, ContentState, RichUtils, convertFromHTML} from "draft-js";
import Editor from "draft-js-plugins-editor";
import {stateToHTML} from "draft-js-export-html";
import createMentionPlugin, {defaultSuggestionsFilter} from "draft-js-mention-plugin";
import "./DraftWrapper.css";

import "draft-js-mention-plugin/lib/plugin.css";

const Entry = props => {
  const {
    mention,
    theme,
    searchValue, // eslint-disable-line no-unused-vars
    isFocused, // eslint-disable-line no-unused-vars
    ...parentProps
  } = props;

  return (
    <div {...parentProps}>
      <div className={theme.mentionSuggestionsEntryContainer}>
        <div className={theme.mentionSuggestionsEntryContainerLeft}>
          <div className={theme.mentionSuggestionsEntryText}>
            {`${mention.name.replace(/[{}]/g, "")}: ${mention.value}`}
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
      mentionTrigger: "{",
      mentionComponent: mentionProps => 
        <span
          className={mentionProps.className}
          // eslint-disable-next-line no-alert
          onClick={() => alert("Clicked on the Mention!")}
        >
          {mentionProps.mention.value}
        </span>
    });
    let editorState = EditorState.createEmpty();
    if (this.props.defaultValue && this.props.defaultValue !== "") {
      const blocks = convertFromHTML(this.props.defaultValue);
      editorState = EditorState.createWithContent(ContentState.createFromBlockArray(blocks.contentBlocks, blocks.entityMap));
    }
    const suggestions = Object.keys(this.props.variables).map(k => ({
      name: `{{${k}}}`,
      value: this.props.variables[k]
    }));
    this.state = {
      editorState,
      suggestions
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
    this.onAddMention = obj => {
      console.log(obj);
    };
  }

  handleKeyCommand(command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return "handled";
    }
    return "not-handled";
  }

  render() {

    const {MentionSuggestions} = this.mentionPlugin;
    const plugins = [this.mentionPlugin];

    return <div>
      <div className="draft-editor">
        <Editor 
          key="draft-editor"
          editorState={this.state.editorState} 
          handleKeyCommand={this.handleKeyCommand} 
          plugins={plugins}
          ref={c => this.editor = c}
          onChange={this.onChange} 
        />
        <MentionSuggestions
          key="mentions"
          onSearchChange={this.onSearchChange}
          suggestions={this.state.suggestions}
          onAddMention={this.onAddMention}
          entryComponent={Entry}
        />
      </div>
    </div>;
  }

}

export default DraftWrapper;
