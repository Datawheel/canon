import axios from "axios";
import React, {Component} from "react";
import {Dialog, Alert, Intent} from "@blueprintjs/core";
import varSwapRecursive from "../../utils/varSwapRecursive";
import Loading from "components/Loading";
import FooterButtons from "../FooterButtons";
import MoveButtons from "../MoveButtons";
import TextEditor from "../editors/TextEditor";
import PlainTextEditor from "../editors/PlainTextEditor";
import deepClone from "../../utils/deepClone";
import PropTypes from "prop-types";
import Flag from "./Flag";
import "./TextCard.css";

class TextCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null,
      displayData: null,
      initialData: null,
      alertObj: false
    };
  }

  componentDidMount() {
    this.hitDB.bind(this)();
  }

  componentDidUpdate(prevProps) {
    if (this.state.minData && (JSON.stringify(prevProps.variables) !== JSON.stringify(this.props.variables) || JSON.stringify(this.props.selectors) !== JSON.stringify(prevProps.selectors))) {
      this.formatDisplay.bind(this)();
    }
    if (prevProps.item.id !== this.props.item.id || prevProps.locale !== this.props.locale) {
      this.hitDB.bind(this)();
    }
  }

  hitDB() {
    const {item, type, locale} = this.props;
    const {id} = item;
    axios.get(`/api/cms/${type}/get/${id}`).then(resp => {
      // If this has been opened with a non english locale, and there is NO row for that locale,
      // create a placeholder row that can be edited in the text boxes (and later saved)
      const minData = resp.data;
      if (!minData.content.find(c => c.lang === locale)) {
        const english = minData.content.find(c => c.lang === "en");
        const newLangObj = {id: minData.id, lang: locale};
        Object.keys(english).forEach(k => {
          if (k !== "id" && k !== "lang") newLangObj[k] = english[k];
        });
        minData.content.push(newLangObj);
      }
      this.setState({minData}, this.formatDisplay.bind(this));
    });
  }

  formatDisplay() {
    const {variables, selectors, locale} = this.props;
    const {formatters} = this.context;
    const {minData} = this.state;
    // Setting "selectors" here is pretty hacky. The varSwap needs selectors in order
    // to run, and it expects them INSIDE the object. Find a better way to do this without
    // polluting the object itself
    minData.selectors = selectors;
    // Swap vars, and extract the actual (multilingual) content
    const content = varSwapRecursive(minData, formatters, variables).content;
    const english = content.find(c => c.lang === "en");
    const currLang = content.find(c => c.lang === locale);
    // Map over each of the english keys, and fetch its equivalent locale version (or default to english)
    const displayData = {};
    Object.keys(english).forEach(k => {
      displayData[k] = currLang[k] ? currLang[k] : english[k];
    });
    this.setState({displayData});  
  }

  save() {
    const {type, fields, plainfields, locale} = this.props;
    const {minData} = this.state;
    const payload = {id: minData.id};
    const thisLocale = minData.content.find(c => c.lang === locale);
    // For some reason, an empty quill editor reports its contents as <p><br></p>. Do not save
    // this to the database - save an empty string instead.
    fields.forEach(field => thisLocale[field] = thisLocale[field] === "<p><br></p>" ? "" : thisLocale[field]);
    if (plainfields) plainfields.forEach(field => thisLocale[field] = thisLocale[field] === "<p><br></p>" ? "" : thisLocale[field]);
    payload.allowed = minData.allowed;
    payload.content = [thisLocale];
    axios.post(`/api/cms/${type}/update`, payload).then(resp => {
      if (resp.status === 200) {
        this.setState({isOpen: false}, this.formatDisplay.bind(this));
        if (this.props.onSave) this.props.onSave(minData);
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
    const {displayData, minData, isOpen, alertObj} = this.state;
    const {variables, fields, plainfields, type, parentArray, item, locale} = this.props;
    const {ordering} = item;

    if (!minData || !displayData) return <Loading />;

    let cardClass = "splash-card";
    if (["profile_stat", "topic_stat"].includes(type)) cardClass = "stat-card";
    const displaySort = ["title", "value", "subtitle", "description"];
    const displays = Object.keys(displayData)
      .filter(k => typeof displayData[k] === "string" && !["id", "lang", "image", "profile_id", "allowed", "date", "ordering", "slug", "label", "type"].includes(k))
      .sort((a, b) => displaySort.indexOf(a) - displaySort.indexOf(b));

    return (
      <div className={`cms-card cms-${cardClass}`}>

        <Alert
          cancelButtonText="Cancel"
          confirmButtonText={alertObj.confirm}
          className="cms-confirm-alert"
          iconName="pt-icon-warning-sign"
          intent={Intent.DANGER}
          isOpen={alertObj}
          onConfirm={alertObj.callback}
          onCancel={() => this.setState({alertObj: false})}
          inline="true"
        >
          {alertObj.message}
        </Alert>

        <Flag locale={locale} />

        {/* title & edit toggle button */}
        <h5 className="cms-card-header">
          <button className="cms-button" onClick={this.openEditor.bind(this)}>
            Edit <span className="pt-icon pt-icon-cog" /> 
          </button>
        </h5>

        { displays.map((k, i) =>
          <p key={i} className={k} dangerouslySetInnerHTML={{__html: displayData[k]}} />
        )}

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
          isOpen={isOpen}
          onClose={this.maybeCloseEditorWithoutSaving.bind(this)}
          title="Text Editor"
          inline="true"
        >
          <div className="pt-dialog-body">
            <PlainTextEditor data={minData} locale={locale} fields={plainfields} />
            <TextEditor data={minData} locale={locale} variables={variables} fields={fields.sort((a, b) => displaySort.indexOf(a) - displaySort.indexOf(b))} />
          </div>
          <FooterButtons
            onDelete={["profile", "section", "topic", "story", "storytopic"].includes(type) ? false : this.maybeDelete.bind(this)}
            onSave={this.save.bind(this)}
          />
        </Dialog>
      </div>
    );
  }

}

TextCard.contextTypes = {
  formatters: PropTypes.object
};

export default TextCard;
