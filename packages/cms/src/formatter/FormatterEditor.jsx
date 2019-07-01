import axios from "axios";
import React, {Component} from "react";
import PropTypes from "prop-types";
import Accardion from "../components/interface/Accardion";

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
      <Accardion
        title="Formatters"
        entity="formatter"
        addItem={this.addItem.bind(this)}
        description="Javascript Formatters for Canon text components"
        cards={formatters && formatters
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(g => <GeneratorCard
            context="formatter"
            key={g.id}
            item={g}
            onSave={this.onSave.bind(this)}
            onDelete={this.onDelete.bind(this)}
            type="formatter"
            variables={{}}
          />)
        }
      />
    );
  }
}

FormatterEditor.contextTypes = {
  formatters: PropTypes.object
};

export default FormatterEditor;
