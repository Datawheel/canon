import axios from "axios";
import React, {Component} from "react";
import {Dialog} from "@blueprintjs/core";
import GeneratorEditor from "../editors/GeneratorEditor";
import FooterButtons from "../editors/components/FooterButtons";
import {connect} from "react-redux";
import deepClone from "../../utils/deepClone";
import LocaleName from "./components/LocaleName";
import VarTable from "../variables/VarTable";
import Card from "./Card";
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
    if (this.state.minData) {
      const {id} = this.state.minData;
      const {localeDefault, localeSecondary} = this.props.status;
      let locales = [localeDefault];
      if (this.props.status.localeSecondary) locales = locales.concat([localeSecondary]);
      const changed = locales.some(loc => 
        ["_genStatus", "_matStatus"].some(status => 
          prevProps.status.variables[loc] && 
          prevProps.status.variables[loc][status] && 
          this.props.status.variables[loc] && 
          this.props.status.variables[loc][status] && 
          JSON.stringify(prevProps.status.variables[loc][status][id]) !== JSON.stringify(this.props.status.variables[loc][status][id])
        )
      );
      if (changed) this.formatDisplay.bind(this)();
    }
    if (prevProps.forceOpen !== this.props.forceOpen && this.props.forceOpen) {
      this.openEditor.bind(this)();
    }
  }

  hitDB() {
    const {item, type, forceOpen} = this.props;
    const {id} = item;
    axios.get(`/api/cms/${type}/get/${id}`).then(resp => {
      // If this card Mounted at the same time that forceOpen was set, that means
      // the user created a new card, and we should open it immediately.
      const callback = () => {
        this.formatDisplay.bind(this)();
        if (forceOpen) this.openEditor.bind(this)();
      };
      this.setState({minData: resp.data}, callback);
    });
  }

  formatDisplay() {
    const {type} = this.props;
    const {localeDefault, localeSecondary} = this.props.status;
    const variables = this.props.status.variables[localeDefault];
    const secondaryVariables = this.props.status.variables[localeSecondary];
    const {id} = this.state.minData;
    let displayData, secondaryDisplayData = {};
    if (type === "generator") {
      displayData = variables._genStatus[id];
      if (localeSecondary) {
        secondaryDisplayData = secondaryVariables._genStatus[id];
      }
    }
    else if (type === "materializer") {
      displayData = variables._matStatus[id];
      if (localeSecondary) {
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
    const {id} = minData;
    axios.delete(`/api/cms/${type}/delete`, {params: {id}}).then(resp => {
      if (resp.status === 200) {
        this.setState({isOpen: false});
        if (this.props.onDelete) this.props.onDelete(type, id, resp.data);
      }
    });
  }

  save() {
    const {type} = this.props;
    const {minData} = this.state;
    axios.post(`/api/cms/${type}/update`, minData).then(resp => {
      if (resp.status === 200) {
        this.setState({isOpen: false});
        let config;
        if (type === "generator" || type === "materializer") config = {type, ids: [minData.id]};
        if (this.props.onSave) this.props.onSave(config);
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
    const {attr, context, type, item, onMove, parentArray} = this.props;
    const {localeDefault, localeSecondary} = this.props.status;
    const {variables} = this.props.status;
    const {displayData, secondaryDisplayData, minData, isOpen, alertObj} = this.state;

    let description = "";
    let showDesc = false;
    if (minData && minData.description) {
      description = minData.description;
      if (description.toLowerCase() !== "new description" && description.toLowerCase() !== "") {
        showDesc = true;
      }
    }

    // define initial/loading props for Card
    const cardProps = {
      cardClass: context,
      localeSecondary,
      title: "•••" // placeholder
    };

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

    const {id} = this.props.item;

    return (
      <React.Fragment>
        <Card {...cardProps} key={`${cardProps.title}-${id}`}>

          {showDesc &&
            <p className="cms-card-description">{description}</p>
          }

          {/* show variables, but not for formatter cards */}
          {context !== "formatter" &&
            <div className="cms-card-locale-group">
              <div className="cms-card-locale-container">
                {localeSecondary &&
                  <LocaleName>{localeDefault}</LocaleName>
                }
                <VarTable dataset={displayData} />
              </div>

              {localeSecondary &&
                <div className="cms-card-locale-container">
                  <LocaleName>{localeSecondary}</LocaleName>
                  <VarTable dataset={secondaryDisplayData} />
                </div>
              }
            </div>
          }
        </Card>

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
              attr={attr}
              data={minData}
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

const mapStateToProps = state => ({
  status: state.cms.status
});

export default connect(mapStateToProps)(GeneratorCard);
