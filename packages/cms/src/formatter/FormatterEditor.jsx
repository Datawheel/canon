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
    axios.get("/api/cms/formattertree").then(resp => {
      this.setState({formatters: resp.data});
    });
  }

  addItem() {
    axios.post("/api/cms/formatter/new", {}).then(resp => {
      const {formatters} = this.state;
      formatters.push(resp.data);
      this.setState({formatters});
    });
  }

  onSave() {
    this.forceUpdate();
  }

  onDelete(type, newArray) {
    this.setState({formatters: newArray});
  }

  render() {

    const {formatters} = this.state;

    return (
      <div className="cms-panel formatter-panel" id="formatter-editor">
        <div className="cms-editor">

          <h2 className="cms-section-heading">
            Formatters
            <button className="cms-button cms-section-heading-button" onClick={this.addItem.bind(this)}>
              <span className="bp3-icon bp3-icon-plus" />
            </button>
          </h2>
          <p className="bp3-text-muted">Javascript Formatters for Canon text components.</p>
          <div className="cms-card-list">
            { formatters && formatters
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(g => <GeneratorCard
                key={g.id}
                item={g}
                onSave={this.onSave.bind(this)}
                onDelete={this.onDelete.bind(this)}
                type="formatter"
                variables={{}}
              />)
            }
          </div>
        </div>
      </div>
    );
  }
}

FormatterEditor.contextTypes = {
  formatters: PropTypes.object
};

export default FormatterEditor;
