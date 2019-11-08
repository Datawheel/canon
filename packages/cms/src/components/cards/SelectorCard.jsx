import {connect} from "react-redux";
import React, {Component} from "react";
import {Dialog} from "@blueprintjs/core";
import PropTypes from "prop-types";
import FooterButtons from "../editors/components/FooterButtons";
import SelectorEditor from "../editors/SelectorEditor";
import DefinitionList from "../variables/DefinitionList";
import VarList from "../variables/VarList";
import deepClone from "../../utils/deepClone";
import Card from "./Card";

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
    this.props.updateEntity("selector", minData);
    this.props.setStatus({toolboxDialogOpen: false});
    this.setState({isOpen: false});
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
    const {id} = this.props.minData;
    this.props.deleteEntity("selector", {id});
  }

  openEditor() {
    const minData = deepClone(this.props.minData);
    const isOpen = true;
    this.props.setStatus({toolboxDialogOpen: true});
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
      cardClass: "selector",
      title: "•••"
    };

    // fill in real card props
    if (minData) {
      Object.assign(cardProps, {
        // title: varSwap(minData.title, formatters, variables),
        title: minData.name === "newselector" ? "New selector" : minData.name,
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

    const {id} = this.props.minData;

    return (
      <React.Fragment>
        <Card {...cardProps} key={`${cardProps.title}-${id}`}>

          {minData &&
            <React.Fragment>
              {/* content preview */}
              <DefinitionList definitions={[
                {
                  label: "label",
                  text: minData.title
                },
                {
                  label: "selections",
                  text: minData.type === "single" ? "one" : "multiple"
                }
              ]}
              />

              {varList.length
                ? <React.Fragment>
                  <div className="cms-definition-label u-font-xxxs">options:</div>
                  <VarList vars={varList} />
                </React.Fragment> : ""
              }
            </React.Fragment>
          }
        </Card>

        {/* edit mode */}
        <Dialog
          className="generator-editor-dialog"
          isOpen={isOpen}
          onClose={this.maybeCloseEditorWithoutSaving.bind(this)}
          title="Selector Editor"
          icon={false}
          usePortal={false}
        >
          <div className="bp3-dialog-body">
            <SelectorEditor
              markAsDirty={this.markAsDirty.bind(this)}
              data={this.state.minData}
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

SelectorCard.contextTypes = {
  formatters: PropTypes.object
};

const mapStateToProps = (state, ownProps) => ({
  status: state.cms.status,
  minData: state.cms.profiles.find(p => p.id === state.cms.status.currentPid).selectors.find(s => s.id === ownProps.id)
});

const mapDispatchToProps = dispatch => ({
  updateEntity: (type, payload) => dispatch(updateEntity(type, payload)),
  deleteEntity: (type, payload) => dispatch(deleteEntity(type, payload)),
  setStatus: status => dispatch(setStatus(status))
});

export default connect(mapStateToProps, mapDispatchToProps)(SelectorCard);
