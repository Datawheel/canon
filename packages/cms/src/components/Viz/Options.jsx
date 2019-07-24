import React, {Component} from "react";
import {withNamespaces} from "react-i18next";
import {connect} from "react-redux";
import {animateScroll} from "react-scroll";
import PropTypes from "prop-types";
import "./Options.css";

import {select} from "d3-selection";
import {saveAs} from "file-saver";
import JSZip from "jszip";
import axios from "axios";
import {saveElement} from "d3plus-export";
import {strip} from "d3plus-text";

import Button from "../fields/Button";
import ButtonGroup from "../fields/ButtonGroup";

import {Checkbox, Dialog, Icon, Label, NonIdealState, Spinner, Tab, Tabs} from "@blueprintjs/core";
import {Cell, Column, SelectionModes, Table} from "@blueprintjs/table";
import "@blueprintjs/table/lib/css/table.css";

import ShareDirectLink from "./ShareDirectLink";
import ShareFacebookLink from "./ShareFacebookLink";
import ShareTwitterLink from "./ShareTwitterLink";

import ReactTable from "react-table";

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
      imageContext: "section",
      imageProcessing: false,
      includeSlug: true,
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
      if (type === "svg") node = select(node).select(".d3plus-viz").node();
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
    const {openDialog} = this.state;
    const {transitionDuration} = this.props;

    if (slug && !this.state.openDialog) {
      setTimeout(() => {

        /* IE is the wurst with CSSTransitionGroup */
        document.getElementsByClassName("options-dialog")[0].style.opacity = 1;

        /* give focus to the correct tab */
        document.getElementById(`bp3-tab-title_undefined_${slug}`).focus();

      }, transitionDuration + 1000);
    }
    else if (!slug) {
      setTimeout(() => {

        /* give focus back to the original button */
        document.getElementById(`options-button-${this.props.slug}-${openDialog}`).focus();

      }, transitionDuration + 1000);
    }

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
    this.setState({imageContext: imageContext === "section" ? "viz" : "section"});
  }

  onBlur(ref) {
    this[ref].blur();
  }

  onFocus(ref) {
    this[ref].select();
  }

  // add the slug, or not
  handleSectionCheck() {
    this.setState({includeSlug: !this.state.includeSlug});
  }

  render() {

    const {backgroundColor, imageContext, imageProcessing, includeSlug, openDialog, results, title} = this.state;
    const {data, iconOnly, slug, t, transitionDuration} = this.props;

    // construct URL from a combination of redux & context (#537)
    const domain = this.props.location.origin;
    const path = this.context.router.location.pathname;
    const shareURL = `${domain}/${path}`;

    const node = this.getNode();
    const svgAvailable = node && select(node).select(".d3plus-viz").size() > 0;

    const ImagePanel = () => imageProcessing
      ? <div className="bp3-dialog-body save-image">
        <NonIdealState title={t("CMS.Options.Generating Image")} visual={<Spinner />} />
      </div>
      : <div className="bp3-dialog-body save-image">
        <div className="save-image-btn" onClick={this.onSave.bind(this, "png")} tabIndex={0}>
          <Icon icon="media" iconSize={28} />PNG
        </div>
        {svgAvailable && <div className="save-image-btn" onClick={this.onSave.bind(this, "svg")} tabIndex={0}>
          <Icon icon="code-block" iconSize={28} />SVG
        </div>}
        <div className="image-options">
          <Checkbox checked={imageContext === "viz"} label={t("CMS.Options.Only Download Visualization")} onChange={this.toggleContext.bind(this)} />
          <Checkbox checked={!backgroundColor} label={t("CMS.Options.Transparent Background")} onChange={this.toggleBackground.bind(this)} />
        </div>
      </div>;

    const columns = results ? Object.keys(results[0]).filter(d => d.indexOf("ID ") === -1 && d.indexOf("Slug ") === -1) : [];

    const columnWidths = columns.map(key => {
      if (key === "Year") return 60;
      else if (key.includes("Year")) return 150;
      else if (key.includes("ID ")) return 120;
      else return 150;
    });

    const cellRenderer = (rowIndex, columnIndex) => {
      const key = columns[columnIndex];
      const val = results[rowIndex][key];
      return <Cell wrapText={true}>{ val }</Cell>;
    };

    const dataUrl = typeof data === "string"
      ? data.indexOf("http") === 0 ? data : `${ domain }${ data }`
      : false;

    // console.log("results", results);
    // const formattedColumns = columns.map(column =>
    //   Object.assign({}, {
    //     key: column,
    //     width: 200,
    //     title: column
    //   })
    // );
    // console.log("columns", formattedColumns);

    const DataPanel = () => results
      ? <div className="bp3-dialog-body view-table">
        <div className="horizontal download">
          <Button key="data-download" icon="download" fontSize="xxs" onClick={this.onCSV.bind(this)}>
            {t("CMS.Options.Download as CSV")}
          </Button>
          { dataUrl && <input key="data-url" type="text" ref={input => this.dataLink = input} onClick={this.onFocus.bind(this, "dataLink")} onMouseLeave={this.onBlur.bind(this, "dataLink")} readOnly="readonly" value={dataUrl} /> }
        </div>
        <div
          className="table"
          tabIndex={0}
          onFocus={() => document.getElementById("bp3-tab-title_undefined_view-table").focus()}>

          <Table
            columnWidths={columnWidths}
            enableColumnResizing={false}
            enableMultipleSelection={false}
            enableRowResizing={false}
            numRows={ results.length }
            rowHeights={results.map(() => 40)}
            selectionModes={SelectionModes.NONE}>
            { columns.map(c => <Column id={ c } key={ c } name={ c } cellRenderer={ cellRenderer } />) }
          </Table>
        </div>
      </div>
      : <div className="bp3-dialog-body view-table">
        <NonIdealState title={t("CMS.Options.Loading Data")} visual={<Spinner />} />
      </div>;

    const shareLink = `${ shareURL }${ includeSlug && slug ? `#${slug}` : "" }`;

    const SharePanel = () =>
      <div className="bp3-dialog-body share-dialog">

        {/* to slug or not to slug */}
        <Checkbox
          small
          checked={this.state.includeSlug}
          label={t("CMS.Options.Scroll to section")}
          onChange={this.handleSectionCheck.bind(this)}
        />

        {/* direct link */}
        <ShareDirectLink link={shareLink} />

        {/* direct link */}
        <Label>
          <span className="u-font-xs options-label-text">{t("CMS.Options.Social")}</span>
          <ButtonGroup fill={true}>
            <ShareFacebookLink link={shareLink} />
            <ShareTwitterLink link={shareLink} />
          </ButtonGroup>
        </Label>
      </div>;


    return <div className="Options">

      <ButtonGroup>
        <Button icon="th" iconOnly={iconOnly} fontSize="xxxs" iconPosition="left" id={`options-button-${slug}-view-table`} onClick={this.toggleDialog.bind(this, "view-table")}>
          {t("CMS.Options.View Data")}
        </Button>

        <Button icon="media" iconOnly={iconOnly} fontSize="xxxs" iconPosition="left" id={`options-button-${slug}-save-image`} onClick={this.toggleDialog.bind(this, "save-image")}>
          {t("CMS.Options.Save Image")}
        </Button>

        <Button icon="share" iconOnly={iconOnly} fontSize="xxxs" iconPosition="left" id={`options-button-${slug}-share`} onClick={this.toggleDialog.bind(this, "share")}>
          {t("CMS.Options.Share")}
        </Button>
      </ButtonGroup>

      <Dialog className="options-dialog"
        autoFocus={false}
        isOpen={openDialog}
        onClose={this.toggleDialog.bind(this, false)}
        transitionDuration={transitionDuration}>
        <Tabs onChange={this.toggleDialog.bind(this)} selectedTabId={openDialog}>
          <Tab id="view-table" title={t("CMS.Options.View Data")} panel={<DataPanel />} />
          <Tab id="save-image" title={t("CMS.Options.Save Image")} panel={<ImagePanel />} />
          <Tab id="share" title={t("CMS.Options.Share")} panel={<SharePanel />} />
          <Button icon="small-cross" iconOnly className="close-button bp3-dialog-close-button bp3-minimal" onClick={this.toggleDialog.bind(this, false)}>
            Close
          </Button>
        </Tabs>
      </Dialog>

    </div>;

  }
}

Options.defaultProps = {
  transitionDuration: 100,
  iconOnly: false
};
Options.contextTypes = {
  router: PropTypes.object
};

export default withNamespaces()(connect(state => ({
  location: state.location
}))(Options));
