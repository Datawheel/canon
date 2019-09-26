import axios from "axios";
import React, {Component} from "react";
import {Dialog} from "@blueprintjs/core";
import varSwapRecursive from "../../utils/varSwapRecursive";
import Loading from "components/Loading";
import DefinitionList from "../variables/DefinitionList";
import FooterButtons from "../editors/components/FooterButtons";
import Select from "./../fields/Select";
import TextEditor from "../editors/TextEditor";
import PlainTextEditor from "../editors/PlainTextEditor";
import deepClone from "../../utils/deepClone";
import stripHTML from "../../utils/formatters/stripHTML";
import formatFieldName from "../../utils/formatters/formatFieldName";
import PropTypes from "prop-types";
import LocaleName from "./components/LocaleName";
import Card from "./Card";
import "./TextCard.css";

class TextCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null,
      thisDisplayData: null,
      thatDisplayData: null,
      initialData: null,
      alertObj: false,
      isDirty: false
    };
  }

  componentDidMount() {
    this.hitDB.bind(this)();
  }

  componentDidUpdate(prevProps) {
    if (this.state.minData && (
      JSON.stringify(prevProps.variables) !== JSON.stringify(this.props.variables) ||
      JSON.stringify(this.props.selectors) !== JSON.stringify(prevProps.selectors) ||
      JSON.stringify(this.props.query) !== JSON.stringify(prevProps.query)
    )) {
      this.formatDisplay.bind(this)();
    }
    if (prevProps.item.id !== this.props.item.id || prevProps.locale !== this.props.locale) {
      this.hitDB.bind(this)();
    }
  }

  populateLanguageContent(minData) {
    const {locale, localeDefault, fields, plainfields} = this.props;
    if (!minData.content.find(c => c.locale === localeDefault)) {
      // This is a rare edge case, but in some cases, the DEFAULT
      // Language is not populated. We must scaffold out a fake
      // Starting point with empty strings to base everything on.
      const defCon = {id: minData.id, locale: localeDefault};
      // If for any reason the default was missing fields, set it to a scaffold warning
      fields.forEach(k => !defCon[k] ? defCon[k] = "Missing Default Language Content!" : null);
      if (plainfields) plainfields.forEach(k => !defCon[k] ? defCon[k] = "" : null);
      minData.content.push(defCon);
    }
    if (!minData.content.find(c => c.locale === locale)) {
      const defCon = minData.content.find(c => c.locale === localeDefault);
      const newCon = {id: minData.id, locale};
      if (defCon) {
        Object.keys(defCon).forEach(k => {
          if (k !== "id" && k !== "locale") newCon[k] = defCon[k];
        });
      }
      // If for any reason the default was missing fields, fill the rest with blanks
      fields.forEach(k => !newCon[k] ? newCon[k] = "" : null);
      if (plainfields) plainfields.forEach(k => !newCon[k] ? newCon[k] = "" : null);
      minData.content.push(newCon);
    }
    return minData;
  }

  markAsDirty() {
    const {isDirty} = this.state;
    if (!isDirty) this.setState({isDirty: true});
  }

  hitDB() {
    const {item, type} = this.props;
    const {id} = item;
    axios.get(`/api/cms/${type}/get/${id}`).then(resp => {
      const minData = this.populateLanguageContent.bind(this)(resp.data);
      this.setState({minData}, this.formatDisplay.bind(this));
    });
  }

  formatDisplay() {
    const {variables, selectors, locale, query, localeDefault} = this.props;

    const minData = this.populateLanguageContent.bind(this)(this.state.minData);
    // Setting "selectors" here is pretty hacky. The varSwap needs selectors in order
    // to run, and it expects them INSIDE the object. Find a better way to do this without
    // polluting the object itself
    minData.selectors = selectors;

    const thisFormatters = this.context.formatters[localeDefault];
    // Swap vars, and extract the actual (multilingual) content
    const content = varSwapRecursive(minData, thisFormatters, variables, query).content;
    const thisLang = content.find(c => c.locale === localeDefault);
    // Map over each of the default keys, and fetch its equivalent locale version (or default)
    const thisDisplayData = {};
    if (thisLang) {
      Object.keys(thisLang).forEach(k => {
        thisDisplayData[k] = thisLang[k];
      });
    }

    let thatDisplayData = null;

    if (locale) {
      thatDisplayData = {};
      const thatFormatters = this.context.formatters[locale];
      const content = varSwapRecursive(minData, thatFormatters, variables, query).content;
      const thatLang = content.find(c => c.locale === locale);

      if (thatLang) {
        Object.keys(thatLang).forEach(k => {
          thatDisplayData[k] = thatLang[k];
        });
      }
    }

    this.setState({thisDisplayData, thatDisplayData});
  }

  save() {
    const {type, fields, plainfields, locale, localeDefault, hideAllowed} = this.props;
    const {minData} = this.state;
    const payload = {id: minData.id};

    const thisLocale = minData.content.find(c => c.locale === localeDefault);
    // For some reason, an empty quill editor reports its contents as <p><br></p>. Do not save
    // this to the database - save an empty string instead.
    fields.forEach(field => thisLocale[field] = thisLocale[field] === "<p><br></p>" ? "" : thisLocale[field]);
    if (plainfields) plainfields.forEach(field => thisLocale[field] = thisLocale[field] === "<p><br></p>" ? "" : thisLocale[field]);

    const thatLocale = minData.content.find(c => c.locale === locale);
    // For some reason, an empty quill editor reports its contents as <p><br></p>. Do not save
    // this to the database - save an empty string instead.
    fields.forEach(field => thisLocale[field] = thisLocale[field] === "<p><br></p>" ? "" : thisLocale[field]);
    if (plainfields) plainfields.forEach(field => thisLocale[field] = thisLocale[field] === "<p><br></p>" ? "" : thisLocale[field]);
    // If hideAllowed is true, this TextCard is being used by a top-level Section, whose
    // allowed is controlled elsewhere. Don't accidentally pave it here.
    if (!hideAllowed) payload.allowed = minData.allowed;
    payload.content = locale ? [thisLocale, thatLocale] : [thisLocale];
    axios.post(`/api/cms/${type}/update`, payload).then(resp => {
      if (resp.status === 200) {
        this.setState({isOpen: false, isDirty: false}, this.formatDisplay.bind(this));
        // Only broadcast the title update out to the tree if we are updating the default locale
        if (locale === localeDefault && this.props.onSave) this.props.onSave(minData);
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

  upperCaseFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  prettifyType(type) {
    return this.upperCaseFirst(type
      .replace("story_", "")
      .replace("section_", "")
    );
  }

  chooseVariable(e) {
    const {minData} = this.state;
    minData.allowed = e.target.value;
    this.setState({minData}, this.markAsDirty.bind(this));
  }

  render() {
    const {alertObj, thisDisplayData, thatDisplayData, minData, isOpen} = this.state;
    const {variables, fields, onMove, hideAllowed, plainfields, type, parentArray, item, locale, localeDefault} = this.props;

    if (!minData || !thisDisplayData) return <Loading />;

    let cardClass = "splash-card";
    if (["profile_stat", "section_stat"].includes(type)) cardClass = "cms-stat-card";
    const displaySort = ["title", "value", "subtitle", "description", "tooltip"];

    const thisDisplay = Object.keys(thisDisplayData)
      .filter(k => typeof thisDisplayData[k] === "string" && !["id", "locale", "image", "profile_id", "allowed", "date", "ordering", "slug", "label", "type"].includes(k))
      .sort((a, b) => displaySort.indexOf(a) - displaySort.indexOf(b))
      .map(k => ({
        label: formatFieldName(k, this.prettifyType(type)),
        text: stripHTML(thisDisplayData[k])
        // text: <span dangerouslySetInnerHTML={{__html: stripP(thisDisplayData[k])}} />
      }));

    const thatDisplay = thatDisplayData ? Object.keys(thatDisplayData)
      .filter(k => typeof thatDisplayData[k] === "string" && !["id", "locale", "image", "profile_id", "allowed", "date", "ordering", "slug", "label", "type"].includes(k))
      .sort((a, b) => displaySort.indexOf(a) - displaySort.indexOf(b))
      .map(k => ({
        label: formatFieldName(k, this.prettifyType(type)),
        text: stripHTML(thatDisplayData[k])
        // text: <span dangerouslySetInnerHTML={{__html: stripP(thatDisplayData[k])}} />
      })) : [];

    // Find the first key that isn't empty in the display and use it as the title.
    let title = "";
    thisDisplay.forEach(d => {
      if (!title && d.text) title = d.text;
    });
    if (!title) title = "Missing Title";

    // define props for Card
    const cardProps = {
      cardClass,
      title,
      onEdit: this.openEditor.bind(this),
      onDelete: ["profile", "section", "story", "storysection"].includes(type) ? false : this.maybeDelete.bind(this),
      // reorder
      reorderProps: parentArray ? {
        array: parentArray,
        item,
        type
      } : null,
      onReorder: onMove ? onMove.bind(this) : null,
      // alert
      alertObj,
      onAlertCancel: () => this.setState({alertObj: false})
    };

    const varOptions = [<option key="always" value="always">Always</option>]
      .concat(Object.keys(variables)
        .filter(key => !key.startsWith("_"))
        .sort((a, b) => a.localeCompare(b))
        .map(key => {
          const value = variables[key];
          const type = typeof value;
          const label = !["string", "number", "boolean"].includes(type) ? ` <i>(${type})</i>` : `: ${`${value}`.slice(0, 20)}${`${value}`.length > 20 ? "..." : ""}`;
          return <option key={key} value={key} dangerouslySetInnerHTML={{__html: `${key}${label}`}}></option>;
        }));

    const showVars = Object.keys(variables).length > 0 && !hideAllowed;

    return (
      <Card {...cardProps}>

        {/* preview content */}
        <div className="cms-locale-group">
          <div className="cms-locale-container">
            {locale &&
              <LocaleName locale={localeDefault} />
            }
            <DefinitionList definitions={thisDisplay} />
          </div>

          {locale &&
            <div className="cms-locale-container">
              <LocaleName locale={locale} />
              <DefinitionList definitions={thatDisplay} />
            </div>
          }
        </div>

        {/* edit content */}
        <Dialog
          isOpen={isOpen}
          onClose={this.maybeCloseEditorWithoutSaving.bind(this)}
          title={type ? `${this.prettifyType(type)} editor` : "Text editor"}
          usePortal={false}
        >
          <div className="bp3-dialog-body">

            <div className="cms-dialog-locale-group">
              <div className="cms-dialog-locale-container">
                {locale &&
                  <LocaleName locale={localeDefault} />
                }
                {plainfields && <PlainTextEditor contentType={type} markAsDirty={this.markAsDirty.bind(this)} data={minData} locale={localeDefault} fields={plainfields} />}
                {fields && <TextEditor contentType={type} markAsDirty={this.markAsDirty.bind(this)} data={minData} locale={localeDefault} variables={variables} fields={fields.sort((a, b) => displaySort.indexOf(a) - displaySort.indexOf(b))} />}
              </div>

              {locale &&
                <div className="cms-dialog-locale-container">
                  <LocaleName locale={locale} />
                  {plainfields && <PlainTextEditor contentType={type} markAsDirty={this.markAsDirty.bind(this)} data={minData} locale={locale} fields={plainfields} />}
                  {fields && <TextEditor contentType={type} markAsDirty={this.markAsDirty.bind(this)} data={minData} locale={locale} variables={variables} fields={fields.sort((a, b) => displaySort.indexOf(a) - displaySort.indexOf(b))} />}
                </div>
              }
            </div>

            { showVars &&
              <Select
                label="Visible"
                namespace="cms"
                value={minData.allowed || "always"}
                onChange={this.chooseVariable.bind(this)}
                inline
              >
                {varOptions}
              </Select>
            }
          </div>

          <FooterButtons
            onDelete={["profile", "section", "section", "story", "storysection"].includes(type) ? false : this.maybeDelete.bind(this)}
            onSave={this.save.bind(this)}
          />
        </Dialog>
      </Card>
    );
  }
}

TextCard.contextTypes = {
  formatters: PropTypes.object
};

export default TextCard;
