import axios from "axios";
import React, {Component} from "react";
import ReactTable from "react-table";
import Select from "../components/fields/Select";

class MemberBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      columns: [],
      dimensions: [],
      dimension: "all",
      hierarchies: [],
      hierarchy: "all"
    };
  }

  componentDidMount() {
    this.hitDB.bind(this)();
  }

  hitDB() {
    axios.get("/api/search/all").then(resp => {
      const {data} = resp;
      const columns = [{
        Header: "id",
        accessor: "id"
      }];
      const dimensions = ["all"].concat([... new Set(data.map(d => d.dimension))]);
      const hierarchies = ["all"].concat([... new Set(data.map(d => d.hierarchy))]);
      this.setState({data, columns, dimensions, hierarchies});
    });
  }

  onChange(field, e) {
    const data = this.state.data.filter(d => d[field] === e.target.value);
    this.setState({data, [field]: e.target.value});
  }

  render() {

    const {data, columns, dimensions, dimension, hierarchies, hierarchy} = this.state;

    return (
      <div className="cms-panel member-panel">
        <h3>Filters</h3>
        <Select
          label="Dimension"
          inline
          context="cms"
          value={dimension}
          onChange={this.onChange.bind(this, "dimension")}
        >
          {dimensions.map(dim =>
            <option key={dim} value={dim}>{dim}</option>
          )}
        </Select>
        <Select
          label="Hierarchy"
          inline
          context="cms"
          value={hierarchy}
          onChange={this.onChange.bind(this, "hierarchy")}
        >
          {hierarchies.map(hier =>
            <option key={hier} value={hier}>{hier}</option>
          )}
        </Select>
        <h3>Members</h3>
        <ReactTable
          data={data}
          columns={columns}
        />
      </div>
    );
  }
}

export default MemberBuilder;
