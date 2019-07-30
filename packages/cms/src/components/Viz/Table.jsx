import axios from "axios";
import React, {Component} from "react";
import Parse from "../sections/components/Parse";
import abbreviate from "../../utils/formatters/abbreviate";

import {Icon} from "@blueprintjs/core";
import ReactTable from "react-table";

import "./Table.css";

class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      config: null
    };
  }

  componentDidMount() {
    this.buildConfig.bind(this)();
  }

  buildConfig() {
    const propConfig = this.props.config;
    const {dataFormat} = this.props;

    const defaults = {
      cellFormat: (key, val) => isNaN(val) ? val : abbreviate(val),
      headerFormat: val => val,
      showPagination: false
    };

    const config = Object.assign({}, defaults, propConfig);

    // If the data is an API call, run the axios get and replace .data with its results
    if (typeof config.data === "string") {
      axios.get(config.data).then(resp => {
        config.data = dataFormat(resp.data);
        this.setState({config});
      });
    }
    else {
      config.data = dataFormat(config.data);
      this.setState({config});
    }
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.config) !== JSON.stringify(this.props.config)) {
      this.setState({config: null}, this.buildConfig.bind(this));
    }
  }

  render() {
    const {config} = this.state;

    if (!config) return null;

    const {
      data,
      headerFormat, // (key)
      cellFormat // (key, val)
    } = config;

    // check that we have a valid columns object
    const columns = config.columns &&
      // it it's array, use it as-is; otherwise, make it an array
      Array.isArray(config.columns) ? config.columns : [config.columns] ||
      // otherwise, make an array from all available columns
      Object.keys(data[0]);

    const tableStructure = columns.map(col =>
      Object.assign({
        Header: <button className="cp-table-header-button">
          {headerFormat(col)} <span className="u-visually-hidden">sort by column</span>
          <Icon className="cp-table-header-icon" icon="caret-down" />
        </button>,
        id: col,
        accessor: d => d[col],
        Cell: row =>
          <span className="cp-table-cell-inner">
            {cellFormat(row, row.value)}
          </span>
      })
    );

    // console.log(data);
    // console.log(config);
    // console.log(tableStructure);

    return (
      <div className="cp-table-wrapper">
        <ReactTable
          {...config}
          className="cp-table"
          columns={tableStructure}
        />
      </div>
    );
  }
}

export default Table;
