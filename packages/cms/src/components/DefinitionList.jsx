import React, {Component} from "react";
import "./DefinitionList.css";

export default class DefinitionList extends Component {
  render() {
    const {definitions} = this.props;
    // defintions: [{ label: "term", text: "definition" }]

    return definitions && definitions.length &&
      <dl className="cms-definition-list">
        {definitions.map(d =>
          <React.Fragment key={`dl-${d.label}`}>
            <dt className="cms-definition-label font-xxxs">{d.label}:</dt>
            <dd className="cms-definition-text font-xxs">{d.text}</dd>
          </React.Fragment>
        )}
      </dl>
    ;
  }
}
