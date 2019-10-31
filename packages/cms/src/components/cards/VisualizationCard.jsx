import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {Dialog} from "@blueprintjs/core";
import varSwapRecursive from "../../utils/varSwapRecursive";
import GeneratorEditor from "../editors/GeneratorEditor";
import Loading from "components/Loading";
import Viz from "../Viz/Viz";
import FooterButtons from "../editors/components/FooterButtons";
import deepClone from "../../utils/deepClone";
import Card from "./Card";

import {deleteEntity, updateEntity} from "../../actions/profiles";

import "./VisualizationCard.css";

class VisualizationCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null,
      alertObj: false,
      isDirty: false
    };
  }

  componentDidMount() {
    const {minData} = this.props;
    this.setState({minData: deepClone(minData)});
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.minData) !== JSON.stringify(this.props.minData)) {
      this.setState({minData: deepClone(this.props.minData)});
    }
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
    const {type, minData} = this.props;
    this.props.deleteEntity(type, {id: minData.id});
  }

  save() {
    const {type} = this.props;
    const {minData} = this.state;
    this.props.updateEntity(type, minData);
    this.setState({isOpen: false});
  }

  openEditor() {
    const minData = deepClone(this.props.minData);
    const isOpen = true;
    this.setState({minData, isOpen});
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
    this.setState({isOpen: false, alertObj: false, isDirty: false});
  }

  render() {

    const {minData, showReorderButton} = this.props;
    const {isOpen, alertObj} = this.state;
    const {query} = this.props.status;

    const minDataState = this.state.minData;

    if (!minData) return <Loading />;

    const {selectors, type} = this.props;
    const {localeDefault} = this.props.status;
    // Stories can use VisualizationCards, but don't have variables.
    const variables = this.props.status.variables[localeDefault] ? this.props.status.variables[localeDefault] : {};
    const formatters = this.context.formatters[localeDefault];

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
      reorderProps: showReorderButton ? {
        id: minData.id,
        type
      } : null,
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
            namespace="cms"
            locale={localeDefault}
            debug={true}
            initialVariables={variables}
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
          title="Visualization editor"
          usePortal={false}
        >
          <div className="bp3-dialog-body">
            <GeneratorEditor
              markAsDirty={this.markAsDirty.bind(this)}
              data={minDataState}
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

const mapStateToProps = state => ({
  status: state.cms.status,
  selectors: state.cms.status.currentPid ? state.cms.profiles.find(p => p.id === state.cms.status.currentPid).selectors : []
});

const mapDispatchToProps = dispatch => ({
  updateEntity: (type, payload) => dispatch(updateEntity(type, payload)),
  deleteEntity: (type, payload) => dispatch(deleteEntity(type, payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(VisualizationCard);
