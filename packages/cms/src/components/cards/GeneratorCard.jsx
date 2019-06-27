import axios from "axios";
import React, {Component} from "react";
import {Dialog} from "@blueprintjs/core";
import GeneratorEditor from "../editors/GeneratorEditor";
import FooterButtons from "../FooterButtons";
import deepClone from "../../utils/deepClone";
import LocaleName from "./LocaleName";
import VarTable from "../VarTable";
import CardWrapper from "./CardWrapper";
import "./GeneratorCard.css";

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
    if (prevProps.forceKey !== this.props.forceKey && this.props.forceKey) {
      this.openEditor.bind(this)();
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
        const query = type === "generator" ? {generator: minData.id} : false;
        if (this.props.onSave) this.props.onSave(query);
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
    if (this.props.onClose) this.props.onClose();
    this.setState({minData, isOpen, alertObj, isDirty});
  }

  markAsDirty() {
    const {isDirty} = this.state;
    if (!isDirty) this.setState({isDirty: true});
  }

  render() {
    const {attr, context, type, variables, item, hidden, onMove, parentArray, previews, locale, secondaryLocale} = this.props;
    const {displayData, secondaryDisplayData, minData, isOpen, alertObj} = this.state;

    let description = "";
    let showDesc = false;
    if (minData && minData.description) {
      description = minData.description;
      if (description.toLowerCase() !== "new description" && description.toLowerCase() !== "") {
        showDesc = true;
      }
    }

    // define initial/loading props for CardWrapper
    const cardProps = {
      cardClass: context,
      secondaryLocale,
      title: "•••" // placeholder
    };

    if (hidden && !isOpen) cardProps.style = {display: "none"};

    // add additional props once the data is available
    if (minData && variables) {
      Object.assign(cardProps, {
        title: minData.name, // overwrites placeholder
        onEdit: this.openEditor.bind(this),
        onDelete: this.maybeDelete.bind(this),
        // reorder
        reorderProps: parentArray ? {
          array: parentArray,
          item,
          type
        } : null,
        onReorder: onMove ? onMove.bind(this) : null,
        // alert
        alertObj,
        onAlertCancel: () => this.setState({alertObj: false})
      });
    }

    return (
      <React.Fragment>
        <CardWrapper {...cardProps}>

          {showDesc &&
            <p className="cms-card-description">{description}</p>
          }

          {/* show variables, but not for formatter cards */}
          {context !== "formatter" &&
            <div className="cms-card-locale-group">
              <div className="cms-card-locale-container">
                {secondaryLocale &&
                  <LocaleName>{locale}</LocaleName>
                }
                <VarTable dataset={displayData} />
              </div>

              {secondaryLocale &&
                <div className="cms-card-locale-container">
                  <LocaleName>{secondaryLocale}</LocaleName>
                  <VarTable dataset={secondaryDisplayData} />
                </div>
              }
            </div>
          }
        </CardWrapper>

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
    );
  }
}

GeneratorCard.defaultProps = {
  context: "generator" // mostly a styling hook used for formatter cards
};

export default GeneratorCard;
