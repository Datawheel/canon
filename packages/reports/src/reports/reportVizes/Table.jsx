import React, {Component} from "react";
import PropTypes from "prop-types";
import {dataLoad} from "d3plus-viz";
import {withNamespaces} from "react-i18next";
import abbreviate from "../../utils/formatters/abbreviate";
import stripHTML from "../../utils/formatters/stripHTML";
import {max, min, sum} from "d3-array";
import {withSize} from "react-sizeme";
import {scaleLinear} from "d3-scale";

import {Icon} from "@blueprintjs/core";
import ReactTable from "react-table";

import "./Table.css";

const letters = {
  "i": 2,
  "l": 2,
  "I": 2,
  " ": 4
};

/** */
function spanify(html, cell, onClick) {
  return <span className={`cp-table-cell-inner cp-table-cell-inner-${onClick ? "clickable" : "static"}`} onClick={onClick ? onClick.bind(this, cell.original) : undefined} dangerouslySetInnerHTML={{__html: html}} />;
}

const measureString = str => typeof str === "string" ? sum(str.split("").map(l => letters[l] || l.toUpperCase() === l ? 8 : 6)) : 0;

const defaultCellFormat = (d, val) => isNaN(val) || d.column.id.includes("Year") || val === "" || val === " " ? val : abbreviate(val);

class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      error: false,
      loading: false
    };

    this.viz = React.createRef();
  }

  componentDidMount() {
    this.loadData.bind(this)();
  }

  loadData() {

    const {config, dataFormat} = this.props;
    const url = config.data;

    if (url) {
      // When the user provides immediate data in-line (not a remote call), dataLoad actually returns *before* the
      // loading state has changed.
      const fetch = () => dataLoad.bind({})(url, dataFormat, undefined, (error, data) => {
        // The quickness of that local load means that this comparison still has loading set to "false"
        if (this.state.loading === JSON.stringify(url)) {
          if (error) {
            console.error(error);
            this.setState({error, loading: false});
          }
          else this.setState({data, loading: false});
        }
      });
      // Therefore, run the datafetch AFTER the setstate has completed, so when the fetch callback runs, this.state.loading
      // is set to a value that has meaning for the comparison.
      this.setState({error: false, loading: JSON.stringify(url)}, fetch.bind(this));
    }

  }

  componentDidUpdate(prevProps) {
    const {data} = this.props.config;
    const {loading} = this.state;
    if (loading !== data && JSON.stringify(prevProps.config.data) !== JSON.stringify(data)) {
      this.loadData.bind(this)();
    }
  }

  // render parent header grouping
  // assumes an array with string followed by an array of columns
  renderGrouping = (currColumn, config) => {
    const {headerFormat} = config;

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
  renderColumn = (obj, config) => {
    const {data, headerFormat, cellFormat} = config;
    const col = typeof obj === "string" ? obj : obj.accessor;
    const onClick = typeof obj === "object" ? obj.onClick : undefined;
    const header = obj.Header ? obj.Header : col;
    const title = headerFormat ? headerFormat(header) : header;
    const {print} = this.context;

    /** */
    function formatValue(cell, value) {
      try {
        return cellFormat ? cellFormat(cell, value) : defaultCellFormat(cell, value);
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
    const calculatedMinWidth = min([200, max([padding * 2, columnWidth])]);
    const minWidth = obj.minWidth !== undefined ? obj.minWidth : calculatedMinWidth;
    const maxWidth = obj.maxWidth !== undefined ? obj.maxWidth : calculatedMinWidth < 100 ? calculatedMinWidth : undefined;
    const width = obj.width;

    return Object.assign({}, {
      Header: print
        ? <button className="cp-table-header-button">
          {title}
        </button>
        : <button className="cp-table-header-button">
          {title} <span className="u-visually-hidden">, sort by column</span>
          <Icon className="cp-table-header-icon" icon="caret-down" />
        </button>,
      id: col,
      accessor: d => d[col],
      minWidth,
      maxWidth,
      width,

      /** react-table v6 has extremely strange behavior in this Cell callback - it attempts to choose between two options:
          * 1. if Cell is a purely functional component, run Cell(props), i.e., execute the function.
          * 2. if Cell is a react component, run React.createElement(comp, props), i.e. instantiate a component and pass it props
          * The problem is: react-table uses String(component).includes('.createElement') to determine which one Cell is.
          * On Dev, it is 1 - because there is no "createElement" in this function.
          * On Prod, it can be 2! - if "return <span>" is run here, the transpiling creates a React.createElement, and switches it to type 2.
          * The result is that the cell function isn't run - but this Cell callback must be run for cellStyles to be applied.
          * To get around this - move a spanify function out of scope to trick react-table into using #1 for rendering.
        **/

      Cell: cell => {
        if (obj.cellStyle) {
          try {
            const newCell = obj.cellStyle(cell);
            if (newCell) cell = newCell;  // the spec asks for a return value, but support editing by reference as well.
          }
          catch (e) {
            console.error("Error in cellStyle");
          }
        }
        const html = formatValue(cell, cell.value);
        const span = spanify.bind(this)(html, cell, onClick);
        return span;
      }
    });
  };

  render() {

    const {data, loading} = this.state;
    const {minRowsForPagination, size, t} = this.props;
    const config = {...this.props.config};
    const {d3plus, print} = this.context;
    config.data = data;

    // removes erronous "column" key from Matrix chart configs
    if (config.column) delete config.column;

    let columns = data.length ? Object.keys(data[0]) : [];
    if (Array.isArray(config.columns)) columns = config.columns;
    else if (typeof config.columns === "string") columns = [config.columns];
    else if (typeof config.columns === "function") columns = config.columns(columns);

    const tableStructure = columns.map(col => {
      // if the current column is a string alone, render the column
      if (typeof col === "string" || typeof col === "object" && col.accessor) {
        return this.renderColumn(col, config);
      }
      else if (Array.isArray(col)) {
        return this.renderGrouping(col, config);
      }
      else return {};
    }).filter(Boolean) // handle malformed tables
      .map(d => {   // remove front-end styling method (irrelevant to react-table)
        if (d.cellStyle) delete d.cellStyle;
        return d;
      });


    if (print && typeof window !== "undefined") {
      const totalWidth = sum(tableStructure, d => d.minWidth);
      const widthScale = scaleLinear()
        .domain([0, totalWidth])
        .range([0, size.width - 6]);
      tableStructure
        .forEach(col => {
          col.maxWidth = undefined;
          col.minWidth = widthScale(col.minWidth);
        });
    }

    return (
      <div className="cp-table-wrapper" ref={this.viz}>
        {tableStructure.length
          ? <ReactTable
            resizable={!print}
            sortable={!print}
            loadingText={t("CMS.Table.Loading")}
            nextText={t("CMS.Table.Next")}
            noDataText={t("CMS.Table.No rows found")}
            ofText={t("CMS.Table.of")}
            pageText={t("CMS.Table.Page")}
            previousText={t("CMS.Table.Previous")}
            rowsText={t("CMS.Table.rows")}
            showPagination={data.length >= minRowsForPagination}
            {...config}
            className={`cp-table ${loading ? "cp-table-loading" : ""}`}
            columns={tableStructure}
          />
          : null
        }
        {loading && <div className="cp-loading" dangerouslySetInnerHTML={{__html: config.loadingHTML || d3plus.loadingHTML}} />}
      </div>
    );
  }
}

Table.contextTypes = {
  d3plus: PropTypes.object,
  print: PropTypes.bool
};

Table.defaultProps = {
  minRowsForPagination: 15
};

export default withNamespaces()(withSize()(Table));
