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

    return (
      <div className={"canon-cart-table-panel"}>
        <ReactTable
          className="-striped -highlight"
          columns={cols}
          data={data}
          showPagination={false}
          defaultPageSize={data.length}
          style={{
            height: "500px" // This will force the table body to overflow and scroll, since there is not enough room
          }}
        />
        <hr/>
        <p>{data.length} records</p>
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
