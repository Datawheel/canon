import React, {Component} from "react";
import stripEntities from "../../utils/formatters/stripEntities";
import "./DefinitionList.css";

export default class DefinitionList extends Component {
  render() {
    const {definitions} = this.props;
    // definitions: [{ label: "term", text: "definition" }]

    return definitions && definitions.length
      ? <ul className="cms-definition-list">
        {definitions.map(d => d.text 
          ? <li className="cms-definition-item" key={`dl-${d.label}`}>
            <span className="cms-definition-label u-font-xxxs">{d.label}: </span>
            <span className="cms-definition-text u-font-xxs">{stripEntities(d.text)}</span>
          </li> : ""
        )}
      </ul> : ""
    ;
  }
}
