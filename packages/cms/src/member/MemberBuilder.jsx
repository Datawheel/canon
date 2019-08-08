import axios from "axios";
import React, {Component} from "react";
import ReactTable from "react-table";
import Select from "../components/fields/Select";

import "./MemberBuilder.css";

class MemberBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sourceData: [],
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
      if (resp.status === 200 && resp.data && resp.data[0]) {
        const sourceData = resp.data.sort((a, b) => {
          if (a.dimension === b.dimension) {
            return b.zvalue - a.zvalue;
          }
          return a.dimension < b.dimension ? 1 : -1;
        });
        const data = sourceData;
        const skip = ["stem", "content"];
        const fields = Object.keys(data[0]).filter(d => !skip.includes(d));
        const columns = fields.map(d => ({
          Header: d,
          accessor: d
        }));
        const dimensions = ["all"].concat([... new Set(data.map(d => d.dimension))]);
        const hierarchies = ["all"].concat([... new Set(data.map(d => d.hierarchy))]);
        this.setState({sourceData, data, columns, dimensions, hierarchies});
      } 
      else {
        console.log("Fetch Error in MemberBuilder.jsx");
      }
    });  
  }

  onChange(field, e) {
    const data = this.state.sourceData.filter(d => d[field] === e.target.value || e.target.value === "all");
    this.setState({data, [field]: e.target.value});
  }

  render() {

    const {data, columns, dimensions, dimension, hierarchies, hierarchy} = this.state;

    return (
      <div className="cms-panel member-panel">
        <h3>Filters</h3>
        <div className="cms-member-filter-container">
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
        </div>
        <h3>Members</h3>
        <ReactTable
          className="cms-member-table"
          data={data}
          columns={columns}
        />
      </div>
    );
  }
}

export default MemberBuilder;
