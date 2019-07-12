import React, {Component} from "react";
import "./DefinitionList.css";

export default class DefinitionList extends Component {
  render() {
    const {definitions} = this.props;
    // definitions: [{ label: "term", text: "definition" }]

    return definitions && definitions.length
      ? <ul className="cms-definition-list">
        {definitions.map(d => d.text && d.text !== "New Tooltip" && d.text !== "New Subtitle" && d.text !== "New Description" 
          ? <li className="cms-definition-item" key={`dl-${d.label}`}>
            <span className="cms-definition-label u-font-xxxs">{d.label}: </span>
            <span className="cms-definition-text u-font-xxs">{d.text}</span>
          </li> : ""
        )}
      </ul> : ""
    ;
  }
}
