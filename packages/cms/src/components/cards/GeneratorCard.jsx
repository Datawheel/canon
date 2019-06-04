import axios from "axios";
import React, {Component} from "react";
import {Dialog, Alert, Intent} from "@blueprintjs/core";
import GeneratorEditor from "../editors/GeneratorEditor";
import Loading from "components/Loading";
import FooterButtons from "../FooterButtons";
import Button from "../Button";
import MoveButtons from "../MoveButtons";
import deepClone from "../../utils/deepClone";
import LocaleName from "./LocaleName";
import VarTable from "../VarTable";
import "./GeneratorCard.css";

import ConsoleVariable from "../ConsoleVariable";

class GeneratorCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null,
      initialData: null,
      displayData: null,
      secondaryDisplayData: null,
      alertObj: false,
      isDirty: false
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
    const {variables, secondaryVariables, secondaryLocale, type} = this.props;
    const {id} = this.state.minData;
    let displayData, secondaryDisplayData = {};
    if (type === "generator") {
      displayData = variables._genStatus[id];
      if (secondaryLocale) {
        secondaryDisplayData = secondaryVariables._genStatus[id];
      }
    }
    else if (type === "materializer") {
      displayData = variables._matStatus[id];
      if (secondaryLocale) {
        secondaryDisplayData = secondaryVariables._matStatus[id];
      }
    }
    this.setState({displayData, secondaryDisplayData});
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
    const {isDirty} = this.state;
    if (isDirty) {
      const alertObj = {
        callback: this.closeEditorWithoutSaving.bind(this),
        message: "Are you sure you want to abandon changes?",
        confirm: "Yes, Abandon changes."
      };
      this.setState({alertObj});
    }
    else {
      this.closeEditorWithoutSaving.bind(this)();
    }
  }

  closeEditorWithoutSaving() {
    const {initialData} = this.state;
    const minData = deepClone(initialData);
    const isOpen = false;
    const alertObj = false;
    const isDirty = false;
    this.setState({minData, isOpen, alertObj, isDirty});
  }

  markAsDirty() {
    const {isDirty} = this.state;
    if (!isDirty) this.setState({isDirty: true});
  }

  render() {
    const {attr, context, type, variables, item, parentArray, previews, locale, secondaryLocale} = this.props;
    const {displayData, secondaryDisplayData, minData, isOpen, alertObj} = this.state;

    let description = "";
    let showDesc = false;
    if (minData && minData.description) {
      description = minData.description;
      if (description.toLowerCase() !== "new description" && description.toLowerCase() !== "") {
        showDesc = true;
      }
    }

    return (
      <div className={`cms-card cms-${ context }-card ${ secondaryLocale ? "is-wide" : "" }`}>

        {!minData || !variables
          // loading
          ? <h3 className="cms-card-header">•••</h3>

          // loaded
          : <React.Fragment>
            {/* title & edit toggle button */}
            <h3 className="cms-card-header">
              {minData.name}

              <Button onClick={this.openEditor.bind(this)} icon="cog" naked>
                Edit
              </Button>
            </h3>

            {showDesc &&
              <p className="cms-card-description">{description}</p>
            }

            {/* show variables, but not for formatter cards */}
            {context !== "formatter" &&
              <div className="cms-card-locale-group">
                <div className="cms-card-locale-container">
                  {secondaryLocale &&
                    <h4 className="cms-card-locale">
                      <LocaleName>{locale}</LocaleName>
                    </h4>
                  }
                  <VarTable dataset={displayData} />
                </div>

                {secondaryLocale &&
                  <div className="cms-card-locale-container">
                    <h4 className="cms-card-locale">
                      <LocaleName>{secondaryLocale}</LocaleName>
                    </h4>
                    <VarTable dataset={secondaryDisplayData} />
                  </div>
                }
              </div>
            }

            {/* reorder buttons */}
            {parentArray &&
              <MoveButtons
                item={item}
                array={parentArray}
                type={type}
                onMove={this.props.onMove ? this.props.onMove.bind(this) : null}
              />
            }

            {/* are you suuuuuuuuuuuuuure */}
            <Alert
              cancelButtonText="Cancel"
              confirmButtonText={alertObj.confirm}
              className="cms-confirm-alert"
              iconName="bp3-icon-warning-sign"
              intent={Intent.DANGER}
              isOpen={alertObj}
              onConfirm={alertObj.callback}
              onCancel={() => this.setState({alertObj: false})}
            >
              {alertObj.message}
            </Alert>

            {/* open state */}
            <Dialog
              className="generator-editor-dialog"
              isOpen={isOpen}
              onClose={this.maybeCloseEditorWithoutSaving.bind(this)}
              title="Variable Editor"
              usePortal={false}
              icon={false}
            >

              <div className="bp3-dialog-body">
                <GeneratorEditor
                  markAsDirty={this.markAsDirty.bind(this)}
                  previews={previews}
                  attr={attr}
                  locale={locale}
                  data={minData}
                  variables={variables}
                  type={type}
                />
              </div>
              <FooterButtons
                onDelete={this.maybeDelete.bind(this)}
                onSave={this.save.bind(this)}
              />
            </Dialog>
          </React.Fragment>
        }
      </div>
    );
  }
}

GeneratorCard.defaultProps = {
  context: "generator" // mostly a styling hook used for formatter cards
};

export default GeneratorCard;
