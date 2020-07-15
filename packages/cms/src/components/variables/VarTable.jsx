import React, {Component} from "react";
import {Icon} from "@blueprintjs/core";
import ConsoleVariable from "./ConsoleVariable";
import "./VarTable.css";

export default class VarTable extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showMore: false
    };
  }

  toggle() {
    this.setState({showMore: !this.state.showMore});
  }

  render() {
    const {showMore} = this.state;
    const {dataset, showAll} = this.props;
    const dupes = this.props.dupes || [];

    if (!dataset) return null;

    if (dataset.error || Object.values(dataset).length < 1) {
      return <span className="cms-var-table-error cms-error u-font-xxs">
        <Icon className="cms-var-table-error-icon" icon="warning-sign" /> { dataset.error || "No data returned" }
      </span>;
    }

    const CUTOFF = 10;
    const fullList = Object.keys(dataset);
    const displayList = showAll || showMore ? fullList : fullList.slice(0, CUTOFF);
    const hasMore = fullList.length > CUTOFF;

    return <table className="cms-var-table">
      <tbody className="cms-var-table-body">
        {displayList.map(k =>
          <tr className={`cms-var-table-row${ dupes.includes(k) ? " warning" : "" }`} key={ k }>
            <td className="cms-var-table-cell">
              { k }:
            </td>

            <td className="cms-var-table-cell">
              <ConsoleVariable value={ dataset[k] } />
            </td>
          </tr>
        )}
        {!showAll && hasMore &&
          <tr className="cms-var-table-row">
            <td colSpan={2} className="cms-var-table-more" onClick={this.toggle.bind(this)}>
              <Icon className="cms-var-table-more-icon" icon={showMore ? "remove" : "add"} />
              show {showMore ? `${fullList.length - CUTOFF} less` : `${fullList.length - displayList.length} more`}
            </td>
          </tr>
        }
      </tbody>
    </table>;
  }
}
