import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import varSwapRecursive from "../../utils/varSwapRecursive";
import deepClone from "../../utils/deepClone";

import {Intent} from "@blueprintjs/core";

import Loading from "components/Loading";
import Card from "./Card";
import Viz from "../Viz/Viz";
import VariableEditor from "../editors/VariableEditor";
import Dialog from "../interface/Dialog";

import {deleteEntity, updateEntity} from "../../actions/profiles";
import {setStatus} from "../../actions/status";

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
    const {dialogOpen} = this.props.status;
    const {minData, type} = this.props;
    this.setState({minData: deepClone(minData)});
    if (dialogOpen && dialogOpen.force && dialogOpen.type === type && dialogOpen.id === minData.id) this.openEditor.bind(this)();
  }

  componentDidUpdate(prevProps) {
    const {type} = this.props;

    const didUpdate = this.props.status.justUpdated && this.props.status.justUpdated.type === type && this.props.status.justUpdated.id === this.props.minData.id && JSON.stringify(this.props.status.justUpdated) !== JSON.stringify(prevProps.status.justUpdated);
    if (didUpdate) {
      const Toast = this.context.toast.current;
      const {status} = this.props.status.justUpdated;
      if (status === "SUCCESS") {
        Toast.show({icon: "saved", intent: Intent.SUCCESS, message: "Saved!", timeout: 1000});
        // Clone the new object for manipulation in state.
        this.setState({isOpen: false, minData: deepClone(this.props.minData)});
        this.props.setStatus({dialogOpen: false});
      }
      else if (status === "ERROR") {
        Toast.show({icon: "error", intent: Intent.DANGER, message: "Error: Not Saved!", timeout: 3000});
        // Don't close window
      }
    }

    const somethingOpened = !prevProps.status.dialogOpen && this.props.status.dialogOpen && this.props.status.dialogOpen.force;
    const thisOpened = somethingOpened && this.props.status.dialogOpen.type === type && this.props.status.dialogOpen.id === this.props.minData.id;
    if (thisOpened) {
      this.openEditor.bind(this)();
    }
  }

  maybeDelete() {
    const alertObj = {
      callback: this.delete.bind(this),
      title: "Delete visualization?",
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
    // note: isOpen will close on update success (see componentDidUpdate)
    this.props.updateEntity(type, minData);
  }

  openEditor() {
    const {type} = this.props;
    const minData = deepClone(this.props.minData);
    const isOpen = true;
    this.props.setStatus({dialogOpen: {type, id: minData.id}});
    this.setState({minData, isOpen});
  }

  maybeCloseEditorWithoutSaving() {
    const {isDirty} = this.state;
    if (isDirty) {
      const alertObj = {
        callback: this.closeEditorWithoutSaving.bind(this),
        title: "Close visualization editor and revert changes?",
        confirm: "Close editor",
        theme: "caution"
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
    this.props.setStatus({dialogOpen: false});
    this.setState({isOpen: false, alertObj: false, isDirty: false});
  }

  render() {
    const {minData, showReorderButton} = this.props;
    const {isOpen, alertObj} = this.state;
    const {query, fetchingVariables} = this.props.status;
    const {formatterFunctions} = this.props.resources;

    const minDataState = this.state.minData;

    if (!minData) return <Loading />;

    const {selectors, type} = this.props;
    const {localeDefault} = this.props.status;
    // Stories can use VisualizationCards, but don't have variables.
    const variables = this.props.variables[localeDefault] || {};
    const formatters = formatterFunctions[localeDefault];

    // TODO: add formatters toggle for secondaryLocale & secondaryVariables

    minData.allSelectors = selectors;
    let logic = "return {}";
    // Only calculate the viz render if the user is finished editing and has closed the window.
    if (!isOpen) logic = varSwapRecursive(minData, formatters, variables, query).logic;
    const re = new RegExp(/height\:[\s]*([0-9]+)/g);
    let height = re.exec(logic);
    height = height ? height[1] : "400";

    // Create the config object to pass to the viz, but replace its es6 logic with transpiled es5
    const config = Object.assign({}, minData, {logic});

    let allowed = true;
    if (minDataState) {
      allowed = !minDataState.allowed || minDataState.allowed === "always" || variables[minDataState.allowed];
    }

    const cardProps = {
      type,
      allowed,
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

    let vizProps = {};
    if (!isOpen) {
      vizProps = {
        config,
        namespace: "cms",
        locale: localeDefault,
        debug: true,
        initialVariables: variables,
        variables,
        configOverride: {height},
        options: false
      };
    }

    const dialogProps = {
      title: "Visualization editor",
      isOpen,
      onClose: this.maybeCloseEditorWithoutSaving.bind(this),
      onDelete: this.maybeDelete.bind(this),
      onSave: this.save.bind(this),
      usePortal: false,
      portalProps: {namespace: "cms"}
    };

    const editorProps = {
      type: "visualization",
      data: minDataState,
      markAsDirty: this.markAsDirty.bind(this)
    };

    return (
      <Card {...cardProps}>
        {/* viz preview */}
        {!isOpen && !fetchingVariables &&
          <Viz {...vizProps} key="v" hideOptions={true} />
        }

        {/* editor */}
        <Dialog {...dialogProps} key="d">
          <VariableEditor {...editorProps} />
        </Dialog>
      </Card>
    );
  }
}

VisualizationCard.contextTypes = {
  variables: PropTypes.object,
  toast: PropTypes.object
};

const mapStateToProps = (state, ownProps) => ({
  variables: state.cms.variables,
  status: state.cms.status,
  resources: state.cms.resources,
  selectors: ownProps.type.includes("story")
    ? state.cms.status.currentStoryPid ? state.cms.stories.find(p => p.id === state.cms.status.currentStoryPid).selectors : []
    : state.cms.status.currentPid ? state.cms.profiles.find(p => p.id === state.cms.status.currentPid).selectors : []
});

const mapDispatchToProps = dispatch => ({
  updateEntity: (type, payload) => dispatch(updateEntity(type, payload)),
  deleteEntity: (type, payload) => dispatch(deleteEntity(type, payload)),
  setStatus: status => dispatch(setStatus(status))
});

export default connect(mapStateToProps, mapDispatchToProps)(VisualizationCard);
