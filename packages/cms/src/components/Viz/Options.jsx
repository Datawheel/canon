import React, {Component} from "react";
import "./Options.css";

import {select} from "d3-selection";
import {saveAs} from "file-saver";
import {text} from "d3-request";
import {saveElement} from "d3plus-export";

import {Checkbox, Dialog, Icon} from "@blueprintjs/core";

class Options extends Component {

  constructor(props) {
    super(props);
    this.state = {
      imageContext: "topic",
      openDialog: false
    };
  }

  onCSV() {
    const {title, url} = this.props;
    text(url, (err, data) => {
      if (!err) saveAs(new Blob([data], {type: "text/plain;charset=utf-8"}), `${title}.csv`);
    });
  }

  onSave(type) {
    const {title} = this.props;
    let node = this.getNode();
    if (node) {
      if (type === "svg") node = select(node).select("svg").node();
      console.log(type, node);
      saveElement(node, {filename: title, type});
    }
  }

  getNode() {
    const {component} = this.props;
    const {imageContext} = this.state;
    if (component[imageContext][imageContext]) {
      const elem = component[imageContext][imageContext];
      return elem.nodeType ? elem : elem.container || elem._reactInternalInstance._renderedComponent._hostNode;
    }
    else return false;
  }

  onBlur() {
    this.input.blur();
  }

  onFocus() {
    this.input.select();
  }

  toggleDialog(slug) {
    this.setState({openDialog: slug});
  }

  toggleContext() {
    const {imageContext} = this.state;
    this.setState({imageContext: imageContext === "topic" ? "viz" : "topic"});
  }

  render() {

    const {imageContext, openDialog} = this.state;

    const node = this.getNode();
    const svgAvailable = node && select(node).select("svg").size() > 0;

    const DialogHeader = props => <div className="pt-dialog-header">
      <Icon iconName="export" />
      <h5>{ props.title }</h5>
      <button aria-label="Close" className="pt-dialog-close-button pt-icon-small-cross" onClick={this.toggleDialog.bind(this, false)}></button>
    </div>;

    return <div className="Options">

      <div className="option save-image" onClick={this.toggleDialog.bind(this, "save-image")}>
        <Icon iconName="export" /><span className="option-label">Save Image</span>
      </div>
      <Dialog className="options-dialog" isOpen={openDialog === "save-image"} onClose={this.toggleDialog.bind(this, false)}>
        <DialogHeader slug="save-image" title="Save Image" />
        <div className="pt-dialog-body">
          <div className="save-image-btn" onClick={this.onSave.bind(this, "png")}>
            <Icon iconName="media" />PNG
          </div>
          {svgAvailable && <div className="save-image-btn" onClick={this.onSave.bind(this, "svg")}>
            <Icon iconName="code-block" />SVG
          </div>}
        </div>
        <div className="image-options">
          <Checkbox checked={imageContext === "viz"} label="Only Download Visualization" onChange={this.toggleContext.bind(this)} />
        </div>
      </Dialog>

    </div>;

  }
}

export default Options;
