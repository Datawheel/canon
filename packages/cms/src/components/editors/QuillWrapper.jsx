import React, {Component} from "react";

let Quill;

if (typeof window !== "undefined") {
  Quill = require("react-quill");
  require("react-quill/dist/quill.snow.css");
}

class QuillWrapper extends Component {

  render() {
    if (Quill) {
      const modules = {
        toolbar: [
          ["bold", "italic", "underline", "code", "blockquote", "code-block", "link"],
          [{list: "ordered"}, {list: "bullet"}],
          ["clean"]
        ],
        clipboard: {
          matchVisual: false
        },
        keyboard: {
          bindings: {
            tab: false
          }
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
}

export default QuillWrapper;
