import React, {Component} from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {Dialog, Alert, Intent} from "@blueprintjs/core";
import varSwapRecursive from "../../utils/varSwapRecursive";
import GeneratorEditor from "../editors/GeneratorEditor";
import Loading from "components/Loading";
import Viz from "../Viz";
import FooterButtons from "../FooterButtons";
import MoveButtons from "../MoveButtons";
import deepClone from "../../utils/deepClone";
import "./VisualizationCard.css";

class VisualizationCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null,
      initialData: null,
      alertObj: false,
      isDirty: false
    };
  }

  componentDidMount() {
    this.hitDB.bind(this)();
  }

  hitDB() {
    const {item, type} = this.props;
    const {id} = item;
    axios.get(`/api/cms/${type}/get/${id}`).then(resp => {
      this.setState({minData: resp.data});
    });
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

  markAsDirty() {
    const {isDirty} = this.state;
    if (!isDirty) this.setState({isDirty: true});
  }

  closeEditorWithoutSaving() {
    const {initialData} = this.state;
    const minData = deepClone(initialData);
    const isOpen = false;
    const alertObj = false;
    const isDirty = false;
    this.setState({minData, isOpen, alertObj, isDirty});
  }

  render() {

    const {minData, isOpen, alertObj} = this.state;

    if (!minData) return <Loading />;

    const {selectors, type, variables, secondaryVariables, parentArray, item, previews, locale, secondaryLocale} = this.props;
    const formatters = this.context.formatters[locale];

    // TODO: add formatters toggle for secondaryLocale & secondaryVariables

    minData.selectors = selectors;
    let logic = "return {}";
    // Only calculate the viz render if the user is finished editing and has closed the window.
    if (!isOpen) logic = varSwapRecursive(minData, formatters, variables).logic;
    const re = new RegExp(/height\:[\s]*([0-9]+)/g);
    let height = re.exec(logic);
    height = height ? height[1] : "400";

    // Create the config object to pass to the viz, but replace its es6 logic with transpiled es5
    const config = Object.assign({}, minData, {logic});

    return (
      <div className="cms-card" style={{minHeight: `calc(${height}px + 2.25rem)`}}>
        {/* title & edit toggle button */}
        <h5 className="cms-card-header">
          <span className="cms-card-header-text">
            {config && config.logic_simple && config.logic_simple.data
              ? `${
                config.logic_simple.type}${
                config.logic_simple.type && config.logic_simple.data && ": "}${
                config.logic_simple.data}`
              : config.simple
                ? "No configuration defined"
                : config.logic.replace("return ", "")
            }
          </span>
          <button className="cms-button" onClick={this.openEditor.bind(this)}>
            Edit <span className="bp3-icon bp3-icon-cog" />
          </button>
        </h5>

        {/* reorder buttons */}
        { parentArray &&
          <MoveButtons
            item={item}
            array={parentArray}
            type={type}
            onMove={this.props.onMove ? this.props.onMove.bind(this) : null}
          />
        }

        <Dialog
          className="generator-editor-dialog"
          isOpen={isOpen}
          onClose={this.maybeCloseEditorWithoutSaving.bind(this)}
          title="Variable Editor"
          usePortal={false}
        >
          <div className="bp3-dialog-body">
            <GeneratorEditor
              markAsDirty={this.markAsDirty.bind(this)}
              previews={previews}
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

        { !isOpen ? <Viz config={config} locale={locale} variables={variables} configOverride={{height, scrollContainer: "#item-editor"}} options={false} /> : null }
      </div>
    );
  }

}

VisualizationCard.contextTypes = {
  formatters: PropTypes.object,
  variables: PropTypes.object
};

export default VisualizationCard;
