import React from "react";
import PropTypes from "prop-types";
import {Button} from "@blueprintjs/core";
import {saveAs} from "file-saver";
import JSZip from "jszip";
import {strip} from "d3plus-text";

import {clearCartAction} from "../../../actions";

import "./ActionsPanel.css";

class ActionsPanel extends React.Component {
  constructor(props, ctx) {
    super(props);
    this.onClickClearCart = this.onClickClearCart.bind(this);
    this.onClickDownloadData = this.onClickDownloadData.bind(this);
    this.buildFileName = this.buildFileName.bind(this);
  }

  onClickClearCart() {
    this.context.dispatch(clearCartAction());
  }

  onClickDownloadData() {
    const {cols, data} = this.context.results;

    const colDelim = ",";
    const rowDelim = "\r\n";

    if (data) {

      // CSV Headers
      const columns = cols.map(c => c.accessor);
      let csv = columns.map(val => `\"${val}\"`).join(colDelim);

      // CSV Data
      data.map(datum => {
        csv += rowDelim;
        csv += columns.map(key => {
          const val = datum[key];
          return typeof val === "number" ? val
            : val ? `\"${val}\"` : "";
        }).join(colDelim);
      });

      // CSV File
      const zip = new JSZip();
      const filename = this.buildFileName();
      zip.file(`${filename}.csv`, csv);
      zip.generateAsync({type: "blob"})
        .then(content => saveAs(content, `${filename}.zip`));
    }
  }

  buildFileName() {
    const {datasets, settings} = this.context;
    let str = Object.keys(datasets).reduce((name, key) => `${name  }__${  datasets[key].name}`, "DataCart");

    if (settings.showID.value) {
      str += "__with_IDs";
    }

    if (settings.showMOE.value) {
      str += "__with_MOE";
    }

    if (settings.pivotYear.value) {
      str += "__years_in_rows";
    }
    else {
      str += "__years_in_cols";
    }

    return strip(str.replace(/<[^>]+>/g, ""))
      .replace(/^\-/g, "")
      .replace(/\-$/g, "");
  }

  render() {
    const {datasets} = this.context;
    const emptyCart = Object.keys(datasets).length === 0;

    return (
      <div className={"canon-cart-actions-panel"}>
        <Button onClick={this.onClickDownloadData} fill={true} minimal={true} disabled={emptyCart}>Download Data</Button>
        <Button onClick={this.onClickClearCart} fill={true} minimal={true} disabled={emptyCart}>Clear Data</Button>
      </div>
    );
  }
}

ActionsPanel.contextTypes = {
  results: PropTypes.object,
  datasets: PropTypes.object,
  dispatch: PropTypes.func,
  settings: PropTypes.object
};

ActionsPanel.propTypes = {
};

ActionsPanel.defaultProps = {
};

export const defaultProps = ActionsPanel.defaultProps;
export default ActionsPanel;
