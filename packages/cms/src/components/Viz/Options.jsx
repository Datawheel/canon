import React, {Component} from "react";
import {connect} from "react-redux";
import {animateScroll} from "react-scroll";
import "./Options.css";

import {select} from "d3-selection";
import {saveAs} from "file-saver";
import JSZip from "jszip";
import axios from "axios";
import {saveElement} from "d3plus-export";
import {strip} from "d3plus-text";

import {Button, Checkbox, Dialog, Icon, NonIdealState, Spinner, Tab, Tabs} from "@blueprintjs/core";
import {Cell, Column, SelectionModes, Table} from "@blueprintjs/table";
import "@blueprintjs/table/lib/css/table.css";

const filename = str => strip(str.replace(/<[^>]+>/g, ""))
  .replace(/^\-/g, "")
  .replace(/\-$/g, "");

const getBackground = elem => {

  // Is current element's background color set?
  const color = select(elem).style("background-color");
  if (color !== "rgba(0, 0, 0, 0)" && color !== "transparent") return color;

  // if not: are you at the body element?
  if (elem === document.body) return "white";
  else return getBackground(elem.parentNode);

};

class Options extends Component {

  constructor(props) {
    super(props);
    this.state = {
      backgroundColor: true,
      imageContext: "topic",
      imageProcessing: false,
      loading: false,
      openDialog: false,
      results: props.data instanceof Array ? props.data : false
    };
  }

  componentDidUpdate(prevProps) {
    const {data} = this.props;
    if (prevProps.data !== data) {
      this.setState({results: data instanceof Array ? data : false});
    }
  }

  onCSV() {
    const {title} = this.props;
    const {results} = this.state;

    const colDelim = ",";
    const rowDelim = "\r\n";

    const columns = Object.keys(results[0]);
    let csv = columns.map(val => `\"${val}\"`).join(colDelim);

    for (let i = 0; i < results.length; i++) {
      const data = results[i];

      csv += rowDelim;
      csv += columns.map(key => {

        const val = data[key];

        return typeof val === "number" ? val
          : val ? `\"${val}\"` : "";

      }).join(colDelim);

    }

    const zip = new JSZip();
    zip.file(`${filename(title)}.csv`, csv);
    zip.generateAsync({type: "blob"})
      .then(content => saveAs(content, `${filename(title)}.zip`));

  }

  onSave(type) {
    const {title} = this.props;
    let node = this.getNode();
    if (node) {
      this.setState({imageProcessing: true});
      const {backgroundColor} = this.state;
      if (type === "svg") node = select(node).select("svg").node();
      let background;
      if (backgroundColor) background = getBackground(node);
      saveElement(node,
        {filename: filename(title), type},
        {background, callback: () => this.setState({imageProcessing: false})}
      );
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
    const node = this.getNode.bind(this)();
    if (node && !this.state.openDialog) {
      const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
      if (node.offsetTop < scrollTop) animateScroll.scrollTo(node.offsetTop);
    }
    this.setState({openDialog: slug});
    const {results, loading} = this.state;
    if (slug === "view-table" && !results && !loading) {
      const {data, dataFormat} = this.props;
      this.setState({loading: true});
      axios.get(data)
        .then(resp => {
          const results = dataFormat(resp.data);
          this.setState({loading: false, results});
        });
    }
  }

  toggleBackground() {
    this.setState({backgroundColor: !this.state.backgroundColor});
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

    const {backgroundColor, imageContext, imageProcessing, openDialog, results} = this.state;
    const {data, location} = this.props;

    const node = this.getNode();
    const svgAvailable = node && select(node).select("svg").size() > 0;

    const ImagePanel = () => imageProcessing
      ? <div className="bp3-dialog-body save-image">
        <NonIdealState title="Generating Image" visual={<Spinner />} />
      </div>
      : <div className="bp3-dialog-body save-image">
        <div className="save-image-btn" onClick={this.onSave.bind(this, "png")}>
          <Icon icon="media" />PNG
        </div>
        {svgAvailable && <div className="save-image-btn" onClick={this.onSave.bind(this, "svg")}>
          <Icon icon="code-block" />SVG
        </div>}
        <div className="image-options">
          <Checkbox checked={imageContext === "viz"} label="Only Download Visualization" onChange={this.toggleContext.bind(this)} />
          <Checkbox checked={!backgroundColor} label="Transparent Background" onChange={this.toggleBackground.bind(this)} />
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

    const dataUrl = typeof data === "string"
      ? data.indexOf("http") === 0 ? data : `${location.origin}${data}`
      : false;

    const DataPanel = () => results
      ? <div className="bp3-dialog-body view-table">
        <div className="horizontal download">
          <Button icon="download" className="bp3-minimal" onClick={this.onCSV.bind(this)}>
            Download as CSV
          </Button>
          { dataUrl && <input type="text" ref={input => this.dataLink = input} onClick={this.onFocus.bind(this, "dataLink")} onMouseLeave={this.onBlur.bind(this, "dataLink")} readOnly="readonly" value={dataUrl} /> }
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
      : <div className="bp3-dialog-body view-table">
        <NonIdealState title="Loading Data" visual={<Spinner />} />
      </div>;

    return <div className="Options">

      <Button icon="th" className="option view-table" onClick={this.toggleDialog.bind(this, "view-table")}>
        View Data
      </Button>

      <Button icon="export" className="option save-image" onClick={this.toggleDialog.bind(this, "save-image")}>
        Save Image
      </Button>

      <Dialog className="options-dialog" isOpen={openDialog} onClose={this.toggleDialog.bind(this, false)}>
        <Tabs onChange={this.toggleDialog.bind(this)} selectedTabId={openDialog}>
          <Tab id="view-table" title="View Data" panel={<DataPanel />} />
          <Tab id="save-image" title="Save Image" panel={<ImagePanel />} />
          <Button icon="small-cross" aria-label="Close" className="close-button bp3-dialog-close-button bp3-minimal" onClick={this.toggleDialog.bind(this, false)} />
        </Tabs>
      </Dialog>

    </div>;

  }
}

export default connect(state => ({
  location: state.location
}))(Options);
