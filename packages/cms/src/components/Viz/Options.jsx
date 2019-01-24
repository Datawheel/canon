import React, {Component} from "react";
import {connect} from "react-redux";
import "./Options.css";

import {select} from "d3-selection";
import {saveAs} from "file-saver";
import JSZip from "jszip";
import axios from "axios";
import {saveElement} from "d3plus-export";

import {Checkbox, Dialog, Icon, NonIdealState, Spinner, Tab2, Tabs2} from "@blueprintjs/core";
import {Cell, Column, SelectionModes, Table} from "@blueprintjs/table";
import "@blueprintjs/table/dist/table.css";

class Options extends Component {

  constructor(props) {
    super(props);
    this.state = {
      imageContext: "topic",
      loading: false,
      openDialog: false,
      results: props.data instanceof Array ? props.data : false
    };
  }

  onCSV() {
    const {title} = this.props;
    const {results} = this.state;

    const columns = Object.keys(results[0]);
    let csv = columns.join(",");

    for (let i = 0; i < results.length; i++) {
      const data = results[i];

      csv += "\n";
      csv += columns.map(key => {

        const val = data[key];

        return typeof val === "number" ? val
          : val ? `\"${val}\"` : "";

      }).join(",");

    }

    const zip = new JSZip();
    zip.file(`${title}.csv`, csv);
    zip.generateAsync({type: "blob"})
      .then(content => saveAs(content, `${title}.zip`));

  }

  onSave(type) {
    const {title} = this.props;
    let node = this.getNode();
    if (node) {
      if (type === "svg") node = select(node).select("svg").node();
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
    const {results, loading} = this.state;
    if (slug === "view-table" && !results && !loading) {
      const {data, dataFormat} = this.props;
      this.setState({loading: true});
      console.log(data);
      axios.get(data)
        .then(resp => {
          const results = dataFormat(resp.data);
          this.setState({loading: false, results});
        });
    }
  }

  toggleContext() {
    const {imageContext} = this.state;
    this.setState({imageContext: imageContext === "topic" ? "viz" : "topic"});
  }

  onBlur(ref) {
    this[ref].blur();
  }

  onFocus(ref) {
    this[ref].select();
  }

  render() {

    const {imageContext, openDialog, results} = this.state;
    const {data, location} = this.props;

    const node = this.getNode();
    const svgAvailable = node && select(node).select("svg").size() > 0;

    const ImagePanel = () => <div className="pt-dialog-body save-image">
      <div className="save-image-btn" onClick={this.onSave.bind(this, "png")}>
        <Icon iconName="media" />PNG
      </div>
      {svgAvailable && <div className="save-image-btn" onClick={this.onSave.bind(this, "svg")}>
        <Icon iconName="code-block" />SVG
      </div>}
      <div className="image-options">
        <Checkbox checked={imageContext === "viz"} label="Only Download Visualization" onChange={this.toggleContext.bind(this)} />
      </div>
    </div>;

    const columns = results ? Object.keys(results[0]).filter(d => d.indexOf("ID ") === -1 && d.indexOf("Slug ") === -1) : [];

    const columnWidths = columns.map(key => {
      if (key === "Year") return 60;
      else if (key.includes("Year")) return 150;
      else if (key.includes("ID ")) return 120;
      else return 150;
    });

    const renderCell = (rowIndex, columnIndex) => {
      const key = columns[columnIndex];
      const val = results[rowIndex][key];
      return <Cell wrapText={true}>{ val }</Cell>;
    };

    const DataPanel = () => results
      ? <div className="pt-dialog-body view-table">
        <div className="horizontal download">
          <button type="button" className="pt-button pt-icon-download pt-minimal" onClick={this.onCSV.bind(this)}>
            Download as CSV
          </button>
          { typeof data === "string" && <input type="text" ref={input => this.dataLink = input} onClick={this.onFocus.bind(this, "dataLink")} onMouseLeave={this.onBlur.bind(this, "dataLink")} readOnly="readonly" value={`${location.origin}${data}`} /> }
        </div>
        <div className="table">
          <Table allowMultipleSelection={false}
            columnWidths={columnWidths}
            fillBodyWithGhostCells={false}
            isColumnResizable={false}
            isRowResizable={false}
            numRows={ results.length }
            rowHeights={results.map(() => 40)}
            selectionModes={SelectionModes.NONE}>
            { columns.map(c => <Column id={ c } key={ c } name={ c } renderCell={ renderCell } />) }
          </Table>
        </div>
      </div>
      : <div className="pt-dialog-body view-table">
        <NonIdealState title="Loading Data" visual={<Spinner />} />
      </div>;

    return <div className="Options">

      <div className="option view-table" onClick={this.toggleDialog.bind(this, "view-table")}>
        <Icon iconName="th" /><span className="option-label">View Data</span>
      </div>

      <div className="option save-image" onClick={this.toggleDialog.bind(this, "save-image")}>
        <Icon iconName="export" /><span className="option-label">Save Image</span>
      </div>

      <Dialog className="options-dialog" isOpen={openDialog} onClose={this.toggleDialog.bind(this, false)}>
        <Tabs2 onChange={this.toggleDialog.bind(this)} selectedTabId={openDialog}>
          <Tab2 id="view-table" title="View Data" panel={<DataPanel />} />
          <Tab2 id="save-image" title="Save Image" panel={<ImagePanel />} />
          <button aria-label="Close" className="close-button pt-dialog-close-button pt-icon-small-cross" onClick={this.toggleDialog.bind(this, false)}></button>
        </Tabs2>
      </Dialog>

    </div>;

  }
}

export default connect(state => ({
  location: state.location
}))(Options);
