import axios from "axios";
import React, {Component} from "react";
import {Button, NonIdealState} from "@blueprintjs/core";
import PropTypes from "prop-types";
import Loading from "components/Loading";

import GeneratorCard from "../components/cards/GeneratorCard";

class FormatterEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      formatters: []
    };
  }

  componentDidMount() {
    this.hitDB.bind(this)();
  }

  hitDB() {
    axios.get("api/cms/formattertree").then(resp => {
      this.setState({formatters: resp.data});
    });
  }

  addItem() {
    axios.post("/api/cms/formatter/new", {}).then(resp => {
      const {formatters} = this.state;
      formatters.push(resp.data);
      this.setState({formatters});
    });

    /*
    const {minData} = this.state;
    const payload = {};
    payload.profile_id = minData.id;
    // todo: move this ordering out to axios (let the server concat it to the end)
    payload.ordering = minData[propMap[type]].length;
    axios.post(`/api/cms/${type}/new`, payload).then(resp => {
      if (resp.status === 200) {
        if (type === "generator" || type === "materializer") {
          minData[propMap[type]].push({id: resp.data.id, name: resp.data.name, ordering: resp.data.ordering || null});
          this.setState({minData}, this.fetchVariables.bind(this, true));
        }
        else {
          minData[propMap[type]].push({id: resp.data.id, ordering: resp.data.ordering});
          this.setState({minData});
        }
      }
    });
    */
  }

  render() {

    const {formatters} = this.state;

    return (
      <div id="formatter-editor" style={{marginTop: "60px"}}>
        <h4>
          Formatters
          <Button onClick={this.addItem.bind(this)} iconName="add" />
        </h4>
        <p className="pt-text-muted">Javascript Formatters for Canon text components.</p>
        <div className="generator-cards">
          { formatters && formatters
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(g => <GeneratorCard
              key={g.id}
              id={g.id}
              type="formatter"
              variables={{}}
            />)
          }
        </div>
      </div>
    );
  }
}

FormatterEditor.contextTypes = {
  formatters: PropTypes.object
};

export default FormatterEditor;
