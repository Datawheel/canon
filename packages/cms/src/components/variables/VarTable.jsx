import React, {Component} from "react";
import {Icon} from "@blueprintjs/core";
import ConsoleVariable from "./ConsoleVariable";
import "./VarTable.css";

export default class VarTable extends Component {
  render() {
    const {dataset} = this.props;
    const dupes = this.props.dupes || [];

    return dataset
      ? dataset.error || Object.values(dataset).length < 1
        ? <span className="cms-var-table-error cms-error u-font-xxs">
          <Icon className="cms-var-table-error-icon" icon="warning-sign" /> { dataset.error || "No data returned" }
        </span>
        : <table className="cms-var-table">
          <tbody className="cms-var-table-body">
            {Object.keys(dataset).map(k =>
              <tr className="cms-var-table-row" key={ k }>
                {dupes.includes(k) 
                  ? <td className="cms-var-table-cell warning">
                    { k }:
                  </td>
                  : <td className="cms-var-table-cell">
                    { k }:
                  </td>
                }
                
                <td className="cms-var-table-cell">
                  <ConsoleVariable value={ dataset[k] } />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      : null
    ;
  }
}
