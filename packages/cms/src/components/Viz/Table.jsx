import axios from "axios";
import React, {Component} from "react";
import abbreviate from "../../utils/formatters/abbreviate";
import stripHTML from "../../utils/formatters/stripHTML";
import {max, min, sum} from "d3-array";

import {Icon} from "@blueprintjs/core";
import ReactTable from "react-table";

import Button from "../fields/Button";
import "./Table.css";

const letters = {
  "i": 2,
  "l": 2,
  "I": 2,
  " ": 4
};

const measureString = str => typeof str === "string" ? sum(str.split("").map(l => letters[l] || l.toUpperCase() === l ? 8 : 6)) : 0;

const defaultCellFormat = (d, val) => isNaN(val) || d.column.id.includes("Year") ? val : abbreviate(val);

class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      config: null
    };

    this.viz = React.createRef();
  }

  componentDidMount() {
    this.buildConfig.bind(this)();
  }

  buildConfig() {
    const propConfig = this.props.config;
    const {dataFormat, minRowsForPagination} = this.props;

    const paginationButtonProps = {
      className: "cp-table-pagination-button",
      fontSize: "xxs",
      iconOnly: true
    };

    const defaults = {
      cellFormat: defaultCellFormat,
      headerFormat: val => val,
      minRows: 0,
      showPagination: false,
      showPageSizeOptions: false, // good luck
      // custom next/prev buttons when they've been enabled
      PreviousComponent: props =>
        <Button icon="arrow-left" {...paginationButtonProps} {...props}>
          Go to previous page in table
        </Button>,
      NextComponent: props =>
        <Button icon="arrow-right" {...paginationButtonProps} {...props}>
          Go to next page in table
        </Button>
    };

    const config = Object.assign({}, defaults, propConfig);

    // If the data is an API call, run the axios get and replace .data with its results
    if (typeof config.data === "string") {
      axios.get(config.data).then(resp => {
        config.data = dataFormat(resp.data);
        if (config.data && config.data.length >= minRowsForPagination) config.showPagination = true;
        this.setState({config});
      });
    }
    else if (Array.isArray(config.data)) {
      config.data = dataFormat(config.data);
      if (config.data && config.data.length >= minRowsForPagination) config.showPagination = true;
      this.setState({config});
    }
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.config) !== JSON.stringify(this.props.config)) {
      this.setState({config: null}, this.buildConfig.bind(this));
    }
  }

  // determines whether there are any nested arrays at all
  hasNesting(columns) {
    // top level contains arrays
    if (columns && columns.map(col => Array.isArray(col)).filter(c => c).length) {
      return true;
    }
    return false; // no nested columns
  }

  // render parent header grouping
  // assumes an array with string followed by an array of columns
  renderGrouping = currColumn => {
    const {headerFormat} = this.state.config;

    let groupingTitle, nestedColumns;
    if (currColumn[0] && typeof currColumn[0] === "string") groupingTitle = currColumn[0];
    if (currColumn[1] && Array.isArray(currColumn[1])) nestedColumns = currColumn[1];

    if (nestedColumns) {
      if (typeof nestedColumns[0] === "string") {
        return Object.assign({}, {
          Header: headerFormat(groupingTitle),
          accessor: d => d[nestedColumns[0]],
          id: groupingTitle,
          columns: nestedColumns.map(col => this.renderColumn(col))
        });
      }
      else if (Array.isArray(nestedColumns[0])) {
        return Object.assign({}, {
          Header: headerFormat(groupingTitle),
          id: groupingTitle,
          columns: nestedColumns.map(col => this.renderGrouping(col))
        });
      }
    }

    console.log("Invalid columns config passed to table viz; expected either an array of strings, or an array of arrays, each with a string first (table heading grouping title) and an array of strings.");
    return undefined;
  }

  // render ungrouped column
  renderColumn = col => {
    const {data, headerFormat, cellFormat} = this.state.config;
    const title = headerFormat(col);

    /** */
    function formatValue(cell, value) {
      try {
        return cellFormat(cell, value);
      }
      catch (e) {
        console.log("Error in cellFormat: ", e);
        return defaultCellFormat(cell, value);
      }
    }

    const padding = 20;
    const sortIconWidth = 30;

    const values = data.reduce((arr, d) => {
      const html = formatValue({original: d, value: d[col], column: {id: col}}, d[col]);
      const text = stripHTML(html);
      if (!text) {
        const inlineWidth = html.match(/width[:="'\s]{1,}([0-9]{1,})px/);
        arr.push(inlineWidth ? +inlineWidth[1] : 0);
      }
      else {
        arr.push(measureString(text));
      }
      return arr;
    }, [measureString(title) + sortIconWidth]);

    const columnWidth = max(values) + padding;
    const minWidth = min([200, max([padding * 2, columnWidth])]);

    return Object.assign({}, {
      Header: <button className="cp-table-header-button">
        {title} <span className="u-visually-hidden">, sort by column</span>
        <Icon className="cp-table-header-icon" icon="caret-down" />
      </button>,
      id: col,
      accessor: d => d[col],
      minWidth,
      maxWidth: minWidth < 100 ? minWidth : undefined,
      Cell: cell => {
        const html = formatValue(cell, cell.value);
        return <span className="cp-table-cell-inner" dangerouslySetInnerHTML={{__html: html}} />;
      }
    });
  };

  render() {
    const {config} = this.state;
    if (!config) return null;

    const {data} = config;

    // check that we have a valid columns object
    const columns = config.columns &&
      // it it's array, use it as-is; otherwise, make it an array
      Array.isArray(config.columns) ? config.columns : [config.columns] ||
      // otherwise, make an array from all available columns
      Object.keys(data[0]);

    const tableStructure = columns.map(col => {
      // if the current column is a string alone, render the column
      if (typeof col === "string") {
        return this.renderColumn(col);
      }
      else if (Array.isArray(col)) {
        return this.renderGrouping(col);
      }
      else return {};
    }).filter(Boolean); // handle malformed tables

    return (
      <div className="cp-table-wrapper" ref={this.viz}>
        {tableStructure && tableStructure.length
          ? <ReactTable
            {...config}
            className="cp-table"
            columns={tableStructure}
          />
          : console.log("Error: array with undefined returned in Table `columns` prop")
        }
      </div>
    );
  }
}

Table.defaultProps = {
  minRowsForPagination: 15
};

export default Table;
