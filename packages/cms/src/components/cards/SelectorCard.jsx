import axios from "axios";
import React, {Component} from "react";
import {Dialog} from "@blueprintjs/core";
import DefinitionList from "../DefinitionList";
import FooterButtons from "../FooterButtons";
import SelectorEditor from "../editors/SelectorEditor";
import PropTypes from "prop-types";
import deepClone from "../../utils/deepClone";
// import varSwap from "../../utils/varSwap";
import CardWrapper from "./CardWrapper";
import VarList from "../VarList";
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

  /**
   * Note that unlike all other cards, the SelectorCard actually has ALL its data from
   * the start, passed down in props. This was chosen so that the list of options could
   * be shown on the front of the card. Now that Selectors have titles, it may make sense
   * to change this to behave like all other cards, i.e., Fetch their own data on mount
   */
  componentDidMount() {
    this.setState({minData: this.props.minData});
  }

  componentDidUpdate(prevProps) {
    if (prevProps.minData !== this.props.minData) {
      this.setState({minData: this.props.minData});
    }
  }

  markAsDirty() {
    const {isDirty} = this.state;
    if (!isDirty) this.setState({isDirty: true});
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
    this.setState({minData, isOpen, alertObj, isDirty});
  }

  render() {
    const {minData, isOpen, alertObj} = this.state;
    const {locale, onMove, onSave, parentArray, type, variables} = this.props;
    const formatters = this.context.formatters[locale];

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
        onEdit: onSave ? this.openEditor.bind(this) : null,
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

    return (
      <CardWrapper {...cardProps}>

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
                <div className="cms-definition-label font-xxxs">options:</div>
                <VarList vars={varList} />
              </React.Fragment> : ""
            }

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
                  variables={variables}
                  data={minData}
                />
              </div>
              <FooterButtons
                onDelete={this.maybeDelete.bind(this)}
                onSave={this.save.bind(this)}
              />
            </Dialog>
          </React.Fragment>
        }
      </CardWrapper>
    );
  }

}

SelectorCard.contextTypes = {
  formatters: PropTypes.object
};

export default SelectorCard;
