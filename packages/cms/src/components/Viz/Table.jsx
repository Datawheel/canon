import React, {Component} from "react";
import PropTypes from "prop-types";
import {dataLoad} from "d3plus-viz";
import abbreviate from "../../utils/formatters/abbreviate";
import stripHTML from "../../utils/formatters/stripHTML";
import {max, min, sum} from "d3-array";

import {Icon} from "@blueprintjs/core";
import ReactTable from "react-table";

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
    this.setState({error: false, loading: url});
    dataLoad.bind({})(url, dataFormat, undefined, (error, data) => {
      if (JSON.stringify(this.state.loading) === JSON.stringify(url)) {
        if (error) {
          console.error(error);
          this.setState({error, loading: false});
        }
        else this.setState({data, loading: false});
      }
    });

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
  renderColumn = (col, config) => {
    const {data, headerFormat, cellFormat} = config;
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

    const {data, loading} = this.state;
    const {minRowsForPagination} = this.props;
    const config = {...this.props.config};
    const {d3plus} = this.context;
    config.data = data;

    // check that we have a valid columns object
    const columns = config.columns &&
      // it it's array, use it as-is; otherwise, make it an array
      Array.isArray(config.columns) ? config.columns : [config.columns] ||
      // otherwise, make an array from all available columns
      Object.keys(data.length ? data[0] : {});

    const tableStructure = columns.map(col => {
      // if the current column is a string alone, render the column
      if (typeof col === "string") {
        return this.renderColumn(col, config);
      }
      else if (Array.isArray(col)) {
        return this.renderGrouping(col, config);
      }
      else return {};
    }).filter(Boolean); // handle malformed tables

    return (
      <div className="cp-table-wrapper" ref={this.viz}>
        { tableStructure.length
          ? <ReactTable
            showPagination={data.length >= minRowsForPagination}
            {...config}
            className={`cp-table ${loading ? "cp-table-loading" : ""}`}
            columns={tableStructure}
          />
          : console.log("Error: array with undefined returned in Table `columns` prop")
        }
        { loading && <div className="cp-loading" dangerouslySetInnerHTML={{__html: config.loadingHTML || d3plus.loadingHTML}} />}
      </div>
    );
  }
}

Table.contextTypes = {
  d3plus: PropTypes.obj
};

Table.defaultProps = {
  minRowsForPagination: 15
};

export default Table;
