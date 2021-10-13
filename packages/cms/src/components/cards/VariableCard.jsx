import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {Icon, Intent} from "@blueprintjs/core";

import deepClone from "../../utils/deepClone";
import upperCaseFirst from "../../utils/formatters/upperCaseFirst";

import LocaleName from "./components/LocaleName";
import Dialog from "../interface/Dialog";
import VariableEditor from "../editors/VariableEditor";
import VarTable from "../variables/VarTable";
import Card from "./Card";

import {deleteEntity, duplicateEntity, updateEntity, fetchVariables} from "../../actions/profiles";
import {setStatus} from "../../actions/status";

import {GENERATOR_TYPES} from "../../utils/consts/cms";

import "./VariableCard.css";

const isGenMat = d => Object.values(GENERATOR_TYPES).includes(d);
const isGen = d => [GENERATOR_TYPES.GENERATOR, GENERATOR_TYPES.STORY_GENERATOR].includes(d);
const isMat = d => [GENERATOR_TYPES.MATERIALIZER, GENERATOR_TYPES.STORY_MATERIALIZER].includes(d);

class VariableCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null,
      displayData: null,
      secondaryDisplayData: null,
      alertObj: false,
      isDirty: false,
      dupes: [],
      size: 0,
      duration: false
    };
  }

  componentDidMount() {
    const {minData, type} = this.props;
    const {dialogOpen} = this.props.status;
    this.setState({minData: deepClone(minData)});
    this.formatDisplay.bind(this)();
    if (dialogOpen && dialogOpen.force && dialogOpen.type === type && dialogOpen.id === minData.id) this.openEditor.bind(this)();
  }

  componentDidUpdate(prevProps) {
    const {type, minData} = this.props;
    const {id} = minData;

    const didUpdate =
      this.props.status.justUpdated &&
      this.props.status.justUpdated.type === type &&
      this.props.status.justUpdated.id === this.props.minData.id &&
      JSON.stringify(this.props.status.justUpdated) !== JSON.stringify(prevProps.status.justUpdated);
    if (didUpdate) {
      const Toast = this.context.toast.current;
      const {status} = this.props.status.justUpdated;
      if (status === "SUCCESS") {
        Toast.show({icon: "saved", intent: Intent.SUCCESS, message: "Saved!", timeout: 1000});
        // If a gen/mat was saved, re-run fetchvariables for just this one gen/mat.
        if (isGenMat(type)) {
          const config = {type, id: minData.id};
          this.props.fetchVariables(config);
          // Unlike other cards, who can simply set dialogOpen:false in status.js in redux, a gen/mat may have
          // been opened by an "output view" variable. In output view, all cards are hidden, and are selectively
          // and forcefully opened using forceOpen. If a user saves in this state, we can't have redux process
          // the dialogOpen:false, because output view will unmount it before it hits the fetchVariables line above,
          // resulting in variables not updating. So, for gen/mats, wait until fetch is kicked off to hide.
          this.props.setStatus({dialogOpen: false});
        }
        // Clone the new object for manipulation in state.
        this.setState({minData: deepClone(this.props.minData), isOpen: false, isDirty: false});
      }
      else if (status === "ERROR") {
        Toast.show({icon: "error", intent: Intent.DANGER, message: "Error: Not Saved!", timeout: 3000});
        // Don't close window
      }
    }

    // If diffCounter incremented, it means a variables update completed, either from this card saving,
    // or from ANOTHER card saving. If it was this card, we need to update the front panel, if it was another card,
    // we may need to update whether this card contains a duplicate. Either way, format the display.
    if (isGenMat(type)) {
      const variablesChanged = prevProps.status.diffCounter !== this.props.status.diffCounter;
      if (variablesChanged) this.formatDisplay.bind(this)();
    }

    const somethingOpened = !prevProps.status.dialogOpen && this.props.status.dialogOpen && this.props.status.dialogOpen.force;
    const thisOpened = somethingOpened && this.props.status.dialogOpen.type === type && this.props.status.dialogOpen.id === id;
    if (thisOpened) {
      this.openEditor.bind(this)();
    }
  }

  formatDisplay() {
    const {type} = this.props;
    const {localeDefault, localeSecondary} = this.props.status;
    const variables = this.props.variables[localeDefault];
    const secondaryVariables = this.props.variables[localeSecondary];
    const {id} = this.props.minData;
    let displayData, secondaryDisplayData = {};
    let dupes = [];
    let size = 0;
    let duration = false;
    if (isGen(type)) {
      displayData = variables._genStatus[id];
      if (localeSecondary) {
        secondaryDisplayData = secondaryVariables._genStatus[id];
      }
      if (variables._genStatus.durations) duration = variables._genStatus.durations[id];
    }
    else if (isMat(type)) {
      displayData = variables._matStatus[id];
      if (localeSecondary) {
        secondaryDisplayData = secondaryVariables._matStatus[id];
      }
    }
    if (isGenMat(type)) {
      const status = isGen(type) ? "_genStatus" : "_matStatus";
      const theseVars = variables[status][id];
      if (theseVars) {
        const otherGens = Object.keys(variables._genStatus).reduce((acc, _id) =>
          type === "materializer" || type === "story_materializer" || String(id) !== String(_id) ? Object.assign({}, acc, variables._genStatus[_id]) : acc, {});
        const otherMats = Object.keys(variables._matStatus).reduce((acc, _id) =>
          type === "generator" || type === "story_generator" || String(id) !== String(_id) ? Object.assign({}, acc, variables._matStatus[_id]) : acc, {});
        const thoseVars = {...otherGens, ...otherMats};
        dupes = dupes.concat(Object.keys(theseVars).reduce((acc, k) => k !== "error" && thoseVars[k] !== undefined ? acc.concat(k) : acc, []));
        size = JSON.stringify(theseVars).length;
      }
    }
    this.setState({displayData, secondaryDisplayData, dupes, size, duration});
  }

  maybeDuplicate() {
    const {type} = this.props;
    const alertObj = {
      callback: this.duplicate.bind(this),
      title: `Duplicate ${type}?`,
      confirm: `Duplicate ${type}`,
      theme: "caution",
      usePortal: this.props.usePortalForAlert
    };
    this.setState({alertObj});
  }

  duplicate() {
    const {type} = this.props;
    const {id} = this.props.minData;
    this.props.duplicateEntity(type, {id});
  }

  maybeDelete() {
    const alertObj = {
      callback: this.delete.bind(this),
      title: `Delete ${this.props.type}?`,
      confirm: `Delete ${this.props.type}`,
      usePortal: this.props.usePortalForAlert
    };
    this.setState({alertObj});
  }

  delete() {
    const {type} = this.props;
    const {id} = this.props.minData;
    this.props.deleteEntity(type, {id});
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
        title: `Close ${this.props.type} editor and revert changes?`,
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

  markAsDirty() {
    const {isDirty} = this.state;
    if (!isDirty) this.setState({isDirty: true});
  }

  render() {
    const {attr, readOnly, minData, type, showReorderButton, compact} = this.props;
    const {localeDefault, localeSecondary} = this.props.status;
    const {displayData, secondaryDisplayData, isOpen, alertObj, dupes, size, duration} = this.state;
    const variables = this.props.variables[localeDefault] || {};

    let description = "";
    let showDesc = false;
    if (minData && minData.description) {
      description = minData.description;
      if (description.toLowerCase() !== "") {
        showDesc = true;
      }
    }

    let allowed = true;
    if (minData) {
      allowed = !minData.allowed || minData.allowed === "always" || variables[minData.allowed];
    }

    // define initial/loading props for Card
    const cardProps = {
      type,
      readOnly, // currently only used for attributes card
      allowed,
      localeSecondary,
      title: "•••" // placeholder
    };

    const dialogProps = {
      className: "cms-variable-editor-dialog",
      title: `${upperCaseFirst(type)} editor`,
      isOpen,
      onClose: this.maybeCloseEditorWithoutSaving.bind(this),
      onDelete: this.maybeDelete.bind(this),
      onSave: this.save.bind(this),
      usePortal: false,
      icon: false,
      portalProps: {namespace: "cms"}
    };

    const editorProps = {
      attr,
      type,
      data: this.state.minData,
      markAsDirty: this.markAsDirty.bind(this)
    };

    // add additional props once the data is available
    if (minData && variables) {
      Object.assign(cardProps, {
        title: minData.name, // overwrites placeholder
        onEdit: minData.locked ? null : this.openEditor.bind(this),
        onDuplicate: minData.locked || type === "formatter" || type.includes("story") ? null : this.maybeDuplicate.bind(this),
        onDelete: minData.locked ? null : this.maybeDelete.bind(this),
        // reorder
        reorderProps: showReorderButton ? {
          id: minData.id,
          type
        } : null,
        // alert
        alertObj,
        onAlertCancel: () => this.setState({alertObj: false})
      });
    }

    let usesConsole = false;
    if (minData && minData.logic && minData.logic.includes("console.log")) {
      usesConsole = true;
    }

    let status = "ok";
    if (duration) {
      if (duration >= 500 && duration <= 5000) {
        status = "warning";
      }
      else if (duration > 5000) {
        status = "danger";
      }
    }


    return (
      <Fragment>
        <Card {...cardProps} key="c">
          {showDesc &&
            <p className="cms-card-description" key="cd">{description}</p>
          }

          {/* show variables, but not for formatter cards */}
          {type !== "formatter" &&
            <div className="cms-card-locale-group" key="cl">
              <div className="cms-card-locale-container">
                {localeSecondary &&
                  <LocaleName>{localeDefault}</LocaleName>
                }
                {!compact && <VarTable dataset={displayData} dupes={dupes} showAll={minData.id === "attributes"}/>}
              </div>

              {localeSecondary &&
                <div className="cms-card-locale-container" key="cls">
                  <LocaleName>{localeSecondary}</LocaleName>
                  {!compact && <VarTable dataset={secondaryDisplayData} dupes={dupes} showAll={minData.id === "attributes"}/>}
                </div>
              }
            </div>
          }

          {dupes.length > 0 &&
            <p className="cms-card-error u-font-xxs u-margin-top-xs">
              <Icon className="cms-card-error-icon" icon="warning-sign" /> Highlighted variables conflict with another generator or materializer
            </p>
          }
          {size > 10000 &&
            <p className="cms-card-error u-font-xxs u-margin-top-xs">
              <Icon className="cms-card-error-icon" icon="warning-sign" /> Large Generator Warning! {size} characters.
            </p>
          }
          {usesConsole &&
            <p className="cms-card-error u-font-xxs u-margin-top-xs">
              <Icon className="cms-card-error-icon" icon="warning-sign" /> Warning: Remove <pre className="cms-console-warning">console.log</pre>.
            </p>
          }
          {Boolean(duration) &&
            <p className={`cms-card-error cms-card-status-${status} u-font-xxs u-margin-top-xs`}>
              <Icon className="cms-card-error-icon" icon="time" /> {`Duration: ${duration} ms.`}
            </p>
          }
        </Card>

        {/* editor */}
        <Dialog {...dialogProps} key="d">
          <VariableEditor {...editorProps} />
        </Dialog>
      </Fragment>
    );
  }
}

VariableCard.contextTypes = {
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
  fetchVariables: config => dispatch(fetchVariables(config)),
  setStatus: status => dispatch(setStatus(status))
});

export default connect(mapStateToProps, mapDispatchToProps)(VariableCard);
