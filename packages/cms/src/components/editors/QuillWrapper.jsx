import React, {Component} from "react";

let Quill;

if (typeof window !== "undefined") {
  Quill = require("react-quill");
}

class QuillWrapper extends Component {

  render() {
    if (Quill) {
      const modules = {
        toolbar: [
          ["bold", "italic", "underline"],
          ["blockquote", "link"],
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
