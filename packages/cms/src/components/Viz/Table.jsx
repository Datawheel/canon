import axios from "axios";
import React, {Component} from "react";
import Parse from "../sections/components/Parse";
import abbreviate from "../../utils/formatters/abbreviate";

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
      cellFormat: (key, val) => abbreviate(val),
      showPagination: false
    };

    const config = Object.assign({}, defaults, propConfig);

    // If the data is an API call, run the axios get and replace .data with its results
    if (typeof config.data === "string") {
      axios.get(config.data).then(resp => {
        config.data = dataFormat(resp.data);
        if (!config.total) config.total = config.data.reduce((acc, d) => isNaN(d[config.value]) ? acc : acc + Number(d[config.value]), 0);
        this.setState({config});
      });
    }
    else {
      config.data = dataFormat(config.data);
      if (!config.total) config.total = config.data.reduce((acc, d) => isNaN(d[config.value]) ? acc : acc + Number(d[config.value]), 0);
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
      title,
      showPagination,
      headerFormat, // (key)
      cellFormat, // (key, val)
    } = config;

    // check that we have a valid columns object
    let {columns} = config;
    if (columns && typeof columns === "object") {
      // filter out hidden columns
      columns = columns.filter(col => col !== false);
    }
    // for now, just show all the columns; TODO: remove/replace
    else columns = Object.keys(data[0]);

    const tableStructure = columns.map(col =>
      Object.assign({
        Header: col,
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
