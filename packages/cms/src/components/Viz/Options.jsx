import React, {Component} from "react";
import "./Options.css";

import {select} from "d3-selection";
import {saveAs} from "file-saver";
import {text} from "d3-request";
import {saveElement} from "d3plus-export";

import {Dialog, Icon} from "@blueprintjs/core";

class Options extends Component {

  constructor(props) {
    super(props);
    this.state = {
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
    const {component, title} = this.props;
    if (component.viz) {
      const elem = component.viz.container || component.viz._reactInternalInstance._renderedComponent._hostNode;
      saveElement(select(elem).select("svg").node(), {filename: title, type});
    }
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

  render() {
    // const {data, slug, title} = this.props;
    const {openDialog} = this.state;

    const DialogHeader = props => <div className="pt-dialog-header">
      <img src={ `/images/viz/${ props.slug }.svg` } />
      <h5>{ props.title }</h5>
      <button aria-label="Close" className="pt-dialog-close-button pt-icon-small-cross" onClick={this.toggleDialog.bind(this, false)}></button>
    </div>;

    return <div className="Options">

      <div className="option save-image" onClick={this.toggleDialog.bind(this, "save-image")}>
        <span className="option-label">Save Image</span>
      </div>
      <Dialog className="options-dialog" isOpen={openDialog === "save-image"} onClose={this.toggleDialog.bind(this, false)}>
        <DialogHeader slug="save-image" title="Save Image" />
        <div className="pt-dialog-body">
          <div className="save-image-btn" onClick={this.onSave.bind(this, "png")}>
            <Icon iconName="media" />PNG
          </div>
          <div className="save-image-btn" onClick={this.onSave.bind(this, "svg")}>
            <Icon iconName="code-block" />SVG
          </div>
        </div>
      </Dialog>

    </div>;

  }
}

export default Options;
