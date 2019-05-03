import React, {Component} from "react";
import {EditorState, ContentState, RichUtils, convertFromHTML} from "draft-js";
import Editor from "draft-js-plugins-editor";
import {stateToHTML} from "draft-js-export-html";
import createMentionPlugin, {defaultSuggestionsFilter} from "draft-js-mention-plugin";
import "./DraftWrapper.css";

import "draft-js-mention-plugin/lib/plugin.css";

const mentions = [
  {
    name: "Matthew Russell",
    link: "https://twitter.com/mrussell247",
    avatar: "https://pbs.twimg.com/profile_images/517863945/mattsailing_400x400.jpg"
  },
  {
    name: "Julian Krispel-Samsel",
    link: "https://twitter.com/juliandoesstuff",
    avatar: "https://avatars2.githubusercontent.com/u/1188186?v=3&s=400"
  },
  {
    name: "Jyoti Puri",
    link: "https://twitter.com/jyopur",
    avatar: "https://avatars0.githubusercontent.com/u/2182307?v=3&s=400"
  },
  {
    name: "Max Stoiber",
    link: "https://twitter.com/mxstbr",
    avatar: "https://pbs.twimg.com/profile_images/763033229993574400/6frGyDyA_400x400.jpg"
  },
  {
    name: "Nik Graf",
    link: "https://twitter.com/nikgraf",
    avatar: "https://avatars0.githubusercontent.com/u/223045?v=3&s=400"
  },
  {
    name: "Pascal Brandt",
    link: "https://twitter.com/psbrandt",
    avatar: "https://pbs.twimg.com/profile_images/688487813025640448/E6O6I011_400x400.png"
  }
];

class DraftWrapper extends Component {

  constructor(props) {
    super(props);
    this.mentionPlugin = createMentionPlugin();
    let editorState = EditorState.createEmpty();
    if (this.props.defaultValue && this.props.defaultValue !== "") {
      const blocks = convertFromHTML(this.props.defaultValue);
      editorState = EditorState.createWithContent(ContentState.createFromBlockArray(blocks.contentBlocks, blocks.entityMap));
    }
    this.state = {
      editorState,
      suggestions: mentions
    };
    this.onChange = editorState => {
      this.setState({editorState});
      const html = stateToHTML(editorState.getCurrentContent());
      if (this.props.onChange) this.props.onChange(html);
    }; 
    this.onSearchChange = ({value}) => {
      this.setState({
        suggestions: defaultSuggestionsFilter(value, mentions)
      });
    };
    this.onAddMention = () => {
    // get the mention object selected
    };
    this.focus = () => {
      this.editor.focus();
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
      <div className="draft-editor" onClick={this.focus}>
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
        />
      </div>
    </div>;
  }


  /*
  render() {
    if (typeof window !== "undefined") {
      const Quill = require("react-quill");
      require("react-quill/dist/quill.snow.css");
      const modules = {
        toolbar: [
          ["bold", "italic", "underline", "code", "blockquote", "code-block", "link"],
          [{list: "ordered"}, {list: "bullet"}],
          ["clean"]
        ],
        clipboard: {
          matchVisual: false
        }
      };
      return <Quill
        theme="snow"
        modules={modules}
        onChangeSelection={range => range ? this.setState({currentRange: range}) : null}
        ref={c => this.quillRef = c}
        {...this.props}
      />;
    }
    return null;
  }
  */
}

export default DraftWrapper;
