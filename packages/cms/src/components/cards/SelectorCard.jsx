import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import deepClone from "../../utils/deepClone";
import validateDynamic from "../../utils/selectors/validateDynamic";

import {Intent, Icon} from "@blueprintjs/core";

import Card from "./Card";
import Dialog from "../interface/Dialog";
import SelectorEditor from "../editors/SelectorEditor";
import DefinitionList from "../variables/DefinitionList";
import VarList from "../variables/VarList";

import {deleteEntity, duplicateEntity, updateEntity} from "../../actions/profiles";
import {setStatus} from "../../actions/status";

import "./SelectorCard.css";

/**
 * Card Component for displaying dropdown selectors. Selectors may be singular dropdowns
 * or multiselects
 */
class SelectorCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allowSave: true,
      minData: null,
      initialData: null,
      alertObj: false,
      isDirty: false
    };
  }

  componentDidMount() {
    const {dialogOpen} = this.props.status;
    const {minData, type} = this.props;
    this.setState({minData: deepClone(this.props.minData)});
    if (dialogOpen && dialogOpen.force && dialogOpen.type === type && dialogOpen.id === minData.id) this.openEditor.bind(this)();
  }

  componentDidUpdate(prevProps) {
    const {type} = this.props;
    const {id} = this.props.minData;

    const didUpdate = this.props.status.justUpdated && this.props.status.justUpdated.type === type && this.props.status.justUpdated.id === this.props.minData.id && JSON.stringify(this.props.status.justUpdated) !== JSON.stringify(prevProps.status.justUpdated);
    if (didUpdate) {
      const Toast = this.context.toast.current;
      const {status} = this.props.status.justUpdated;
      if (status === "SUCCESS") {
        Toast.show({icon: "saved", intent: Intent.SUCCESS, message: "Saved!", timeout: 1000});
        // Clone the new object for manipulation in state.
        this.setState({isOpen: false, minData: deepClone(this.props.minData)});
      }
      else if (status === "ERROR") {
        Toast.show({icon: "error", intent: Intent.DANGER, message: "Error: Not Saved!", timeout: 3000});
        // Don't close window
      }
    }

    const somethingOpened = !prevProps.status.dialogOpen && this.props.status.dialogOpen && this.props.status.dialogOpen.force;
    const thisOpened = somethingOpened && this.props.status.dialogOpen.type === type && this.props.status.dialogOpen.id === id;
    if (thisOpened) {
      this.openEditor.bind(this)();
    }
  }

  markAsDirty() {
    const {isDirty} = this.state;
    if (!isDirty) this.setState({isDirty: true});
  }

  save() {
    const {minData} = this.state;
    const {type} = this.props;
    // Strip out isDefaults, which were only used for state management.
    const options = minData.options.map(d => {
      const {isDefault, ...rest} = d; // eslint-disable-line
      return rest;
    });
    const payload = {...minData, options};
    // note: isOpen will close on update success (see componentDidUpdate)
    this.props.updateEntity(type, payload);
  }

  maybeDuplicate() {
    const alertObj = {
      callback: this.duplicate.bind(this),
      title: "Duplicate selector?",
      confirm: "Duplicate selector",
      theme: "caution",
      usePortal: this.props.usePortalForAlert
    };
    this.setState({alertObj});
  }

  duplicate() {
    const {id} = this.props.minData;
    const {type} = this.props;
    this.props.duplicateEntity(type, {id});
  }

  maybeDelete() {
    const alertObj = {
      callback: this.delete.bind(this),
      title: "Delete selector?",
      confirm: "Delete selector",
      usePortal: this.props.usePortalForAlert
    };
    this.setState({alertObj});
  }

  delete() {
    const {id} = this.props.minData;
    const {type} = this.props;
    this.props.deleteEntity(type, {id});
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
        title: "Close selector editor and revert changes?",
        confirm: "Close editor",
        theme: "caution"
      };
      this.setState({alertObj});
    }
    else {
      this.closeEditorWithoutSaving.bind(this)();
    }
  }

  closeEditorWithoutSaving() {
    this.setState({isOpen: false, alertObj: false, isDirty: false});
    this.props.setStatus({dialogOpen: false});
  }

  setAllowSave(allowSave) {
    this.setState({allowSave});
  }

  render() {
    const {isOpen, alertObj, allowSave} = this.state;
    const {onMove, parentArray, type, minData} = this.props;
    const {localeDefault} = this.props.status;
    const variables = this.props.variables[localeDefault];

    // define initial card props
    const cardProps = {
      type: "selector",
      title: "•••"
    };

    // fill in real card props
    if (minData) {
      Object.assign(cardProps, {
        // title: varSwap(minData.title, formatters, variables),
        title: minData.name === "" ? "Add a title" : minData.name,
        onEdit: this.openEditor.bind(this),
        onDelete: this.maybeDelete.bind(this),
        onDuplicate: this.maybeDuplicate.bind(this),
        // reorder
        reorderProps: parentArray ? {
          item: minData,
          array: parentArray,
          type
        } : null,
        onReorder: onMove ? onMove.bind(this) : null,
        // alert
        alertObj,
        onAlertCancel: () => this.setState({alertObj: false})
      });
    }

    let varList = [];
    let error = false;
    if (minData) {
      if (minData.dynamic) {
        const dynamicStatus = validateDynamic(variables[minData.dynamic]);
        if (dynamicStatus === "valid") {
          varList = variables[minData.dynamic].map(d => {
            const option = String(d.option || d);
            return minData.default.split(",").includes(option) ? `${option} (default)` : option;
          });
        }
        else {
          error = dynamicStatus;
        }
      }
      else {
        if (minData.options.length > 0) {
          minData.options.forEach(o =>
            typeof variables[o.option] !== "object"
              ? varList.push(minData.default.split(",").includes(String(o.option))
                ? `${variables[o.option]} (default)`
                : variables[o.option]
              ) : null
          );
        }
      }
    }

    const dialogProps = {
      className: "variable-editor-dialog",
      title: "Selector Editor",
      isOpen,
      onClose: this.maybeCloseEditorWithoutSaving.bind(this),
      onDelete: this.maybeDelete.bind(this),
      onSave: allowSave ? this.save.bind(this) : null,
      portalProps: {namespace: "cms"}
    };

    const editorProps = {
      markAsDirty: this.markAsDirty.bind(this),
      setAllowSave: this.setAllowSave.bind(this),
      data: this.state.minData
    };

    let displayData = [];
    if (minData) {
      displayData = [
        {
          label: "label",
          text: minData.title
        },
        {
          label: "selections",
          text: minData.type === "single" ? "one" : "multiple"
        }
      ];
    }

    return (
      <Fragment>
        <Card {...cardProps} key="c">
          {minData &&
            <Fragment key="dl">
              {/* content preview */}
              <DefinitionList definitions={displayData} key="dd" />
              {/* list of variables */}
              {varList.length > 0 && <Fragment key="o">
                <div className="cms-definition-label u-font-xxs">options:</div>
                <VarList vars={varList} />
              </Fragment>}
              {error && <p className="cms-card-error u-font-xxs u-margin-top-xs">
                <Icon className="cms-card-error-icon" icon="warning-sign" /> {error}
              </p>
              }
            </Fragment>
          }
        </Card>

        {/* edit mode */}
        <Dialog {...dialogProps} key="d">
          <SelectorEditor {...editorProps} />
        </Dialog>
      </Fragment>
    );
  }
}

SelectorCard.defaultProps = {
  type: "selector"
};

SelectorCard.contextTypes = {
  formatters: PropTypes.object,
  toast: PropTypes.object
};

const mapStateToProps = state => ({
  variables: state.cms.variables,
  status: state.cms.status
});

const mapDispatchToProps = dispatch => ({
  updateEntity: (type, payload) => dispatch(updateEntity(type, payload)),
  deleteEntity: (type, payload) => dispatch(deleteEntity(type, payload)),
  duplicateEntity: (type, payload) => dispatch(duplicateEntity(type, payload)),
  setStatus: status => dispatch(setStatus(status))
});

export default connect(mapStateToProps, mapDispatchToProps)(SelectorCard);
