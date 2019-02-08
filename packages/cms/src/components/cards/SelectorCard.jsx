import axios from "axios";
import React, {Component} from "react";
import {Dialog, Alert, Intent} from "@blueprintjs/core";
import Loading from "components/Loading";
import FooterButtons from "../FooterButtons";
import MoveButtons from "../MoveButtons";
import SelectorEditor from "../editors/SelectorEditor";
import PropTypes from "prop-types";
import deepClone from "../../utils/deepClone";
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
      alertObj: false
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

  save() {
    const {type} = this.props;
    const {minData} = this.state;
    // In SelectorEditor, we use an "isDefault" property to assist with managing
    // checkbox states. Before we save the data to the db, remove that helper prop
    minData.options = minData.options.map(o => {
      delete o.isDefault;
      return o;
    });
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
    const alertObj = {
      callback: this.closeEditorWithoutSaving.bind(this),
      message: "Are you sure you want to abandon changes?",
      confirm: "Yes, Abandon changes."
    };
    this.setState({alertObj});
  }

  closeEditorWithoutSaving() {
    const {initialData} = this.state;
    const minData = deepClone(initialData);
    const isOpen = false;
    const alertObj = false;
    this.setState({minData, isOpen, alertObj});
  }

  render() {
    const {minData, isOpen, alertObj} = this.state;
    const {variables, parentArray, type} = this.props;

    if (!minData) return <Loading />;

    return (
      <div className="cms-card">

        <Alert
          cancelButtonText="Cancel"
          confirmButtonText={alertObj.confirm}
          className="cms-confirm-alert"
          iconName="bp3-icon-warning-sign"
          intent={Intent.DANGER}
          isOpen={alertObj}
          onConfirm={alertObj.callback}
          onCancel={() => this.setState({alertObj: false})}
          inline="true"
        >
          {alertObj.message}
        </Alert>

        {/* title & edit toggle button */}
        <h5 className="cms-card-header">
          {minData.title}
          <button className="cms-button" onClick={this.openEditor.bind(this)}>
            Edit <span className="bp3-icon bp3-icon-cog" />
          </button>
        </h5>

        <p>{minData.name}</p>

        <ul>
          {minData.options && minData.options.map(o =>
            <li key={o.option} className={minData.default === o.option ? "is-default" : ""}>{o.option}</li>
          )}
        </ul>

        {/* reorder buttons */}
        { parentArray &&
          <MoveButtons
            item={minData}
            array={parentArray}
            type={type}
            onMove={this.props.onMove ? this.props.onMove.bind(this) : null}
          />
        }

        <Dialog
          className="generator-editor-dialog"
          isOpen={isOpen}
          onClose={this.maybeCloseEditorWithoutSaving.bind(this)}
          title="Selector Editor"
          icon="false"
          inline="true"
        >
          <div className="bp3-dialog-body">
            <SelectorEditor variables={variables} data={minData} />
          </div>
          <FooterButtons
            onDelete={this.maybeDelete.bind(this)}
            onSave={this.save.bind(this)}
          />
        </Dialog>
      </div>
    );
  }

}

SelectorCard.contextTypes = {
  formatters: PropTypes.object
};

export default SelectorCard;
