import axios from "axios";
import React, {Component} from "react";
import {Dialog, Alert, Intent} from "@blueprintjs/core";
import GeneratorEditor from "../editors/GeneratorEditor";
import Loading from "components/Loading";
import FooterButtons from "../FooterButtons";
import MoveButtons from "../MoveButtons";
import deepClone from "../../utils/deepClone";
import Flag from "./Flag";
import "./GeneratorCard.css";

import ConsoleVariable from "../ConsoleVariable";

class GeneratorCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null,
      initialData: null,
      displayData: null,
      alertObj: false
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

  maybeDelete() {
    const alertObj = {
      callback: this.delete.bind(this),
      message: "Are you sure you want to delete this?",
      confirm: "Delete"
    };
    this.setState({alertObj});
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

  openEditor() {
    const {minData} = this.state;
    const initialData = deepClone(minData);
    const isOpen = true;
    this.setState({initialData, isOpen});
  }

  maybeCloseEditorWithoutSaving() {
    const alertObj = {
      callback: this.closeEditorWithoutSaving.bind(this),
      message: "Are you sure you want to abandon changes?",
      confirm: "Yes, Abandon changes."
    };
    this.setState({alertObj});
  }

  closeEditorWithoutSaving() {
    const {initialData} = this.state;
    const minData = deepClone(initialData);
    const isOpen = false;
    const alertObj = false;
    this.setState({minData, isOpen, alertObj});
  }

  render() {
    const {type, variables, item, parentArray, preview, locale, localeDefault} = this.props;
    const {displayData, minData, isOpen, alertObj} = this.state;

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

        <Alert
          cancelButtonText="Cancel"
          confirmButtonText={alertObj.confirm}
          className="cms-confirm-alert"
          iconName="pt-icon-warning-sign"
          intent={Intent.DANGER}
          isOpen={alertObj}
          onConfirm={alertObj.callback}
          onCancel={() => this.setState({alertObj: false})}
          inline="true"
        >
          {alertObj.message}
        </Alert>

        <Flag locale={locale} />

        {/* title & edit toggle button */}
        <h5 className="cms-card-header">
          <span className={`cms-card-header-icon pt-icon-standard pt-icon-th ${type}`} />
          {locale === localeDefault ? minData.name : `${minData.name} (${locale})`}
          {/* In multi-lang, there are two sets of gens and mats, one for default, and one for the other locale.
            * If we put an edit button on both, then two visual entities can edit the same db structure, which is confusing
            * the default gen/mat is the "master/only" one, so only show the edit button if this is default (the one for the 
            * other locale is essentially for display purposes only)*/}
          {locale === localeDefault && <button className="cms-button" onClick={this.openEditor.bind(this)}>
            Edit <span className="pt-icon pt-icon-cog" />
          </button>}
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
          isOpen={isOpen}
          onClose={this.maybeCloseEditorWithoutSaving.bind(this)}
          title="Variable Editor"
          inline="true"
          icon="false"
        >

          <div className="pt-dialog-body">
            <GeneratorEditor preview={preview} locale={locale} data={minData} variables={variables} type={type} />
          </div>
          <FooterButtons
            onDelete={this.maybeDelete.bind(this)}
            onSave={this.save.bind(this)}
          />
        </Dialog>
      </div>
    );
  }

}

export default GeneratorCard;
