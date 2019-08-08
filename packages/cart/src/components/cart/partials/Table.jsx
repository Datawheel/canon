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
    const data = [{
      name: "Tanner Linsley",
      age: 26,
      friend: {
        name: "Jason Maurer",
        age: 23
      }
    },
    {
      name: "Tanner Linsley",
      age: 26,
      friend: {
        name: "Jason Maurer",
        age: 23
      }
    }, {
      name: "Tanner Linsley",
      age: 26,
      friend: {
        name: "Jason Maurer",
        age: 23
      }
    }, {
      name: "Tanner Linsley",
      age: 26,
      friend: {
        name: "Jason Maurer",
        age: 23
      }
    }, {
      name: "Tanner Linsley",
      age: 26,
      friend: {
        name: "Jason Maurer",
        age: 23
      }
    }];

    const columns = [{
      Header: "Name",
      accessor: "name" // String-based value accessors!
    }, {
      Header: "Age",
      accessor: "age",
      Cell: props => <span className="number">{props.value}</span> // Custom cell components!
    }, {
      id: "friendName", // Required because our accessor is not a string
      Header: "Friend Name",
      accessor: d => d.friend.name // Custom value accessors!
    }, {
      Header: props => <span>Friend Age</span>, // Custom header components!
      accessor: "friend.age"
    }];

    return (
      <div className={"canon-cart-table-panel"}>
        <ReactTable
          data={data}
          columns={columns}
        />
      </div>
    );
  }
}

Table.contextTypes = {
  datasets: PropTypes.object,
  dispatch: PropTypes.func
};

Table.propTypes = {
};

Table.defaultProps = {
};

export const defaultProps = Table.defaultProps;
export default Table;
