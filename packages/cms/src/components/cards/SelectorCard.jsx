import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import deepClone from "../../utils/deepClone";

import Card from "./Card";
import Dialog from "../interface/Dialog";
import SelectorEditor from "../editors/SelectorEditor";
import DefinitionList from "../variables/DefinitionList";
import VarList from "../variables/VarList";

import {deleteEntity, updateEntity} from "../../actions/profiles";
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
      minData: null,
      initialData: null,
      alertObj: false,
      isDirty: false
    };
  }

  componentDidMount() {
    const {forceType, forceID} = this.props.status;
    this.setState({minData: deepClone(this.props.minData)});
    if (forceType === "selector" && forceID === this.props.minData.id) this.openEditor.bind(this)();
  }

  componentDidUpdate(prevProps) {
    // If the props we receive from redux have changed, then an update action has occured.
    if (JSON.stringify(prevProps.minData) !== JSON.stringify(this.props.minData)) {
      // Clone the new object for manipulation in state.
      this.setState({minData: deepClone(this.props.minData)});
    }
  }

  markAsDirty() {
    const {isDirty} = this.state;
    if (!isDirty) this.setState({isDirty: true});
  }

  save() {
    const {minData} = this.state;
    // Strip out isDefaults, which were only used for state management.
    const options = minData.options.map(d => {
      const {isDefault, ...rest} = d; // eslint-disable-line
      return rest;
    });
    // Deepclone has a bug, it turns NULL keys into {}. The DB can't handle a {} write to a string column.
    // Only use the dynamic key if it's a string, otherwise set it to its proper value of null.
    const dynamic = typeof minData.dynamic === "string" ? minData.dynamic : null;
    const payload = {...minData, options, dynamic};
    this.props.updateEntity("selector", payload);
    this.setState({isOpen: false});
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
    this.props.deleteEntity("selector", {id});
  }

  openEditor() {
    const minData = deepClone(this.props.minData);
    const isOpen = true;
    this.props.setStatus({toolboxDialogOpen: {type: "selector", id: minData.id}});
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
    this.props.setStatus({toolboxDialogOpen: false, forceID: false, forceType: false, forceOpen: false});
  }

  render() {
    const {isOpen, alertObj} = this.state;
    const {onMove, parentArray, type, minData} = this.props;
    const {localeDefault} = this.props.status;
    const variables = this.props.status.variables[localeDefault];

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

    const varList = [];
    if (minData && minData.options.length > 0) {
      minData.options.forEach(o =>
        typeof variables[o.option] !== "object"
          ? varList.push(o.isDefault
            ? `${variables[o.option]} (default)`
            : variables[o.option]
          ) : null
      );
    }

    const dialogProps = {
      className: "variable-editor-dialog",
      title: "Selector Editor",
      isOpen,
      onClose: this.maybeCloseEditorWithoutSaving.bind(this),
      onDelete: this.maybeDelete.bind(this),
      onSave: this.save.bind(this),
      portalProps: {namespace: "cms"}
    };

    const editorProps = {
      markAsDirty: this.markAsDirty.bind(this),
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
              {varList.length && <Fragment key="o">
                <div className="cms-definition-label u-font-xxs">options:</div>
                <VarList vars={varList} />
              </Fragment>}
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

SelectorCard.contextTypes = {
  formatters: PropTypes.object
};

const mapStateToProps = state => ({
  status: state.cms.status
});

const mapDispatchToProps = dispatch => ({
  updateEntity: (type, payload) => dispatch(updateEntity(type, payload)),
  deleteEntity: (type, payload) => dispatch(deleteEntity(type, payload)),
  setStatus: status => dispatch(setStatus(status))
});

export default connect(mapStateToProps, mapDispatchToProps)(SelectorCard);
