import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";

import "react-table/react-table.css";
import "./Table.css";

class Table extends React.Component {
  constructor(props, ctx) {
    super(props);
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps) {

  }

  componentWillUnmount() {

  }

  render() {
    const {cols, data} = this.context.results;

    console.log("TABLE!", cols, data);

    return (
      <div className={"canon-cart-table-panel"}>
        <ReactTable
          columns={cols}
          data={data}
        />
      </div>
    );
  }
}

Table.contextTypes = {
  results: PropTypes.object
};

Table.propTypes = {
};

Table.defaultProps = {
};

export const defaultProps = Table.defaultProps;
export default Table;
