import React, {Component} from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {Dialog} from "@blueprintjs/core";
import varSwapRecursive from "../../utils/varSwapRecursive";
import GeneratorEditor from "../editors/GeneratorEditor";
import Loading from "components/Loading";
import Viz from "../Viz";
import FooterButtons from "../editors/components/FooterButtons";
import deepClone from "../../utils/deepClone";
import Card from "./Card";
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
    const {query} = this.props;

    if (!minData) return <Loading />;

    const {selectors, type, variables, secondaryVariables, parentArray, item, previews, locale, onMove, secondaryLocale} = this.props;
    const formatters = this.context.formatters[locale];

    // TODO: add formatters toggle for secondaryLocale & secondaryVariables

    minData.selectors = selectors;
    let logic = "return {}";
    // Only calculate the viz render if the user is finished editing and has closed the window.
    if (!isOpen) logic = varSwapRecursive(minData, formatters, variables, query).logic;
    const re = new RegExp(/height\:[\s]*([0-9]+)/g);
    let height = re.exec(logic);
    height = height ? height[1] : "400";

    // Create the config object to pass to the viz, but replace its es6 logic with transpiled es5
    const config = Object.assign({}, minData, {logic});

    const cardProps = {
      cardClass: "visualization",
      style: {minHeight: `calc(${height}px + 2.25rem)`},
      title: config && config.logic_simple && config.logic_simple.data
        ? `${
          config.logic_simple.type}${
          config.logic_simple.type && config.logic_simple.data && ": "}${
          config.logic_simple.data}`
        : config.simple || config.logic && config.logic === "return {}"
          ? "No configuration defined"
          : config.logic.replace("return ", ""),
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
    };

    return (
      <Card {...cardProps}>

        {/* viz preview */}
        {!isOpen &&
          <Viz
            config={config}
            locale={locale}
            debug={true}
            variables={variables}
            configOverride={{height, scrollContainer: "#item-editor"}}
            options={false}
          />
        }

        {/* edit mode */}
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
      </Card>
    );
  }

}

VisualizationCard.contextTypes = {
  formatters: PropTypes.object,
  variables: PropTypes.object
};

export default VisualizationCard;
