import React, {Component} from "react";
import {hot} from "react-hot-loader/root";
import stripEntities from "../../utils/formatters/stripEntities";
import "./DefinitionList.css";

class DefinitionList extends Component {
  render() {
    const {definitions} = this.props;
    // definitions: [{ label: "term", text: "definition" }]

    return definitions && definitions.length
      ? <ul className="cms-definition-list">
        {definitions.map(d => d.text && d.text !== "New Tooltip" && d.text !== "New Subtitle" && d.text !== "New Description"
          ? <li className="cms-definition-item" key={`dl-${d.label}`}>
            <span className="cms-definition-label u-font-xxs">{d.label}: </span>
            <span className="cms-definition-text u-font-xxs">{stripEntities(d.text)}</span>
          </li> : ""
        )}
      </ul> : ""
    ;
  }
}

export default hot(DefinitionList);
