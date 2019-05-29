import React, {Component} from "react";
import ConsoleVariable from "./ConsoleVariable";
import "./VarTable.css";

export default class VarTable extends Component {
  render() {
    const {dataset} = this.props;

    return (
      <table className="cms-var-table">
        <tbody className="cms-var-table-body">

          {/* check for display data */}
          {dataset && (
            // error
            dataset.error
              ? <tr className="cms-var-table-row">
                <td className="cms-var-table-cell cms-error">
                  { dataset.error ? dataset.error : "error" }
                </td>
              </tr>
              // loop through data
              : Object.keys(dataset).map(k =>
                <tr className="cms-var-table-row" key={ k }>
                  <td className="cms-var-table-cell">
                    { k }:
                  </td>
                  <td className="cms-var-table-cell">
                    <ConsoleVariable value={ dataset[k] } />
                  </td>
                </tr>
              )
          )}
        </tbody>
      </table>
    );
  }
}
