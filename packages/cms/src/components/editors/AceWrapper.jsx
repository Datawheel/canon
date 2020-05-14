import React, {Component} from "react";
import Button from "../fields/Button";
import "./AceTheme.css";
import "./AceWrapper.css";

export default class AceWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFullscreen: false
    };
  }

  componentDidUpdate() {
    if (this.editor) {
      clearTimeout(this.resize);
      this.resize = setTimeout(editor => editor.resize(), 400, this.editor.editor);
    }
  }

  render() {
    const {isFullscreen} = this.state;

    if (typeof window !== "undefined") {
      const Ace = require("react-ace").default;
      require("brace/mode/javascript");

      const options = {
        fontSize: "14px"
        // enableBasicAutocompletion: true,
        // enableLiveAutocompletion: true
      };

      const editorProps = {
        $blockScrolling: Infinity
      };

      return (
        <div className={`cms-ace-container${isFullscreen ? " is-fullscreen" : ""}`}>
          <Button
            className="cms-ace-button"
            namespace="cms"
            iconOnly
            active={isFullscreen}
            icon={isFullscreen ? "minimize" : "fullscreen"}
            onClick={() => this.setState({isFullscreen: !isFullscreen})}
            key="b"
          >
            Toggle fullscreen
          </Button>
          <Ace
            width="100%"
            height="100%"
            ref={editor => this.editor = editor}
            wrapEnabled={false}
            tabSize={2}
            mode="javascript"
            setOptions={options}
            editorProps={editorProps}
            key="e"
            {...this.props}
          />
        </div>
      );
    }
    return null;
  }
}
