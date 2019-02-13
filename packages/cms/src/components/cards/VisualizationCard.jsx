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

    const {formatters} = this.context;
    const {selectors, type, variables, parentArray, item, preview, locale, localeDefault} = this.props;

    minData.selectors = selectors;
    const {logic} = varSwapRecursive(minData, formatters, variables);
    const re = new RegExp(/height\:[\s]*([0-9]+)/g);
    let height = re.exec(logic);
    height = height ? height[1] : "400";

    return (
      <div className="cms-card" style={{minHeight: `calc(${height}px + 2.25rem)`}}>
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

        {/* title & edit toggle button */}
        {locale === localeDefault && <h5 className="cms-card-header">
          <button className="cms-button" onClick={this.openEditor.bind(this)}>
            Edit <span className="bp3-icon bp3-icon-cog" />
          </button>
        </h5> }

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
              preview={preview} 
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
        { logic ? <Viz config={{logic}} locale={locale} variables={variables} configOverride={{height, scrollContainer: "#item-editor"}} options={false} /> : <p>No configuration defined.</p> }
      </div>
    );
  }

}

VisualizationCard.contextTypes = {
  formatters: PropTypes.object,
  variables: PropTypes.object
};

export default VisualizationCard;
