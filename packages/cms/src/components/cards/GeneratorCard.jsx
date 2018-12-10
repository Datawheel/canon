import axios from "axios";
import React, {Component} from "react";
import {Dialog} from "@blueprintjs/core";
import GeneratorEditor from "../editors/GeneratorEditor";
import Loading from "components/Loading";
import FooterButtons from "../FooterButtons";
import MoveButtons from "../MoveButtons";
import "./GeneratorCard.css";

import ConsoleVariable from "../ConsoleVariable";

class GeneratorCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null,
      displayData: null
    };
  }

  componentDidMount() {
    this.hitDB.bind(this)();
  }

  componentDidUpdate(prevProps) {
    if (this.state.minData && prevProps.variables !== this.props.variables) {
      this.formatDisplay.bind(this)();
    }
  }

  hitDB() {
    const {item, type} = this.props;
    const {id} = item;
    axios.get(`/api/cms/${type}/get/${id}`).then(resp => {
      this.setState({minData: resp.data}, this.formatDisplay.bind(this));
    });
  }

  formatDisplay() {
    const {variables, type} = this.props;
    const {id} = this.state.minData;
    let displayData = {};
    if (type === "generator") {
      displayData = variables._genStatus[id];
    }
    else if (type === "materializer") {
      displayData = variables._matStatus[id];
    }
    this.setState({displayData});
  }

  delete() {
    const {type} = this.props;
    const {minData} = this.state;
    axios.delete(`/api/cms/${type}/delete`, {params: {id: minData.id}}).then(resp => {
      if (resp.status === 200) {
        this.setState({isOpen: false});
        if (this.props.onDelete) this.props.onDelete(type, resp.data);
      }
    });
  }

  save() {
    const {type} = this.props;
    const {minData} = this.state;
    axios.post(`/api/cms/${type}/update`, minData).then(resp => {
      if (resp.status === 200) {
        this.setState({isOpen: false});
        if (this.props.onSave) this.props.onSave();
      }
    });
  }

  render() {
    const {type, variables, item, parentArray} = this.props;
    const {displayData, minData, isOpen} = this.state;

    let description = "";
    let showDesc = false;
    if (minData && minData.description) {
      description = minData.description;
      if (description.toLowerCase() !== "new description" && description.toLowerCase() !== "") {
        showDesc = true;
      }
    }

    if (!minData || !variables) return <Loading />;

    return (
      <div className="cms-card">

        {/* title & edit toggle button */}
        <h5 className="cms-card-header">
          <span className={`cms-card-header-icon pt-icon-standard pt-icon-th ${type}`} />
          {minData.name}
          <button className="cms-button" onClick={() => this.setState({isOpen: true})}>
            Edit <span className="pt-icon pt-icon-cog" />
          </button>
        </h5>


        {/* if there's a useful description or display data, print a table */}
        <table className="cms-card-table">
          <tbody className="cms-card-table-body">

            {/* if there's a description, print it */}
            {showDesc &&
              <tr className="cms-card-table-row">
                <td className="cms-card-table-cell">
                  description
                </td>
                <td className="cms-card-table-cell">
                  <ConsoleVariable value={ description } />
                </td>
              </tr>
            }

            {/* check for display data */}
            {displayData && (
              // error
              displayData.error
                ? <tr className="cms-card-table-row">
                  <td className="cms-card-table-cell cms-error">
                    { displayData.error ? displayData.error : "error" }
                  </td>
                </tr>
                // loop through data
                : Object.keys(displayData).map(k =>
                  <tr className="cms-card-table-row" key={ k }>
                    <td className="cms-card-table-cell">
                      { k }:
                    </td>
                    <td className="cms-card-table-cell">
                      <ConsoleVariable value={ displayData[k] } />
                    </td>
                  </tr>
                )
            )}
          </tbody>
        </table>

        {/* reorder buttons */}
        { parentArray &&
          <MoveButtons
            item={item}
            array={parentArray}
            type={type}
            onMove={this.props.onMove ? this.props.onMove.bind(this) : null}
          />
        }

        {/* open state */}
        <Dialog
          className="generator-editor-dialog"
          iconName="code"
          isOpen={isOpen}
          onClose={() => this.setState({isOpen: false})}
          title="Variable Editor"
          inline="true"
        >

          <div className="pt-dialog-body">
            <GeneratorEditor data={minData} variables={variables} type={type} />
          </div>
          <FooterButtons
            onDelete={this.delete.bind(this)}
            onCancel={() => this.setState({isOpen: false})}
            onSave={this.save.bind(this)}
          />
        </Dialog>
      </div>
    );
  }

}

export default GeneratorCard;
