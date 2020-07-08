import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import varSwapRecursive from "../../utils/varSwapRecursive";
import deepClone from "../../utils/deepClone";
import stripHTML from "../../utils/formatters/stripHTML";
import formatFieldName from "../../utils/formatters/formatFieldName";
import upperCaseFirst from "../../utils/formatters/upperCaseFirst";

import {Intent, Switch, Alignment} from "@blueprintjs/core";

import Loading from "components/Loading";
import Card from "./Card";
import LocaleName from "./components/LocaleName";
import VisibleSelector from "../interface/VisibleSelector";
import Dialog from "../interface/Dialog";
import RichTextEditor from "../editors/RichTextEditor";
import PlainTextEditor from "../editors/PlainTextEditor";
import DefinitionList from "../variables/DefinitionList";

import {updateEntity, deleteEntity} from "../../actions/profiles";
import {setStatus} from "../../actions/status";

import "./TextCard.css";

class TextCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      minData: null,
      primaryDisplayData: null,
      secondaryDisplayData: null,
      initialData: null,
      alertObj: false,
      isDirty: false,
      customAllowed: false
    };
  }

  componentDidMount() {
    const {dialogOpen} = this.props.status;
    const {minData, type} = this.props;
    this.setState({minData: deepClone(minData)}, this.formatDisplay.bind(this));
    if (dialogOpen && dialogOpen.force && dialogOpen.type === type && dialogOpen.id === minData.id) this.openEditor.bind(this)();
  }

  componentDidUpdate(prevProps) {
    const {type} = this.props;
    const idChanged = prevProps.minData.id !== this.props.minData.id;
    const variablesChanged = prevProps.status.diffCounter !== this.props.status.diffCounter;
    const selectorsChanged = JSON.stringify(this.props.selectors) !== JSON.stringify(prevProps.selectors);
    const queryChanged = JSON.stringify(this.props.status.query) !== JSON.stringify(prevProps.status.query);
    const didUpdate = this.props.status.justUpdated && this.props.status.justUpdated.type === type && this.props.status.justUpdated.id === this.props.minData.id && JSON.stringify(this.props.status.justUpdated) !== JSON.stringify(prevProps.status.justUpdated);

    if (idChanged) {
      this.setState({minData: deepClone(this.props.minData)}, this.formatDisplay.bind(this));
    }

    if (variablesChanged || selectorsChanged || queryChanged) {
      this.formatDisplay.bind(this)();
    }

    if (didUpdate) {
      const Toast = this.context.toast.current;
      const {status} = this.props.status.justUpdated;
      if (status === "SUCCESS") {
        Toast.show({icon: "saved", intent: Intent.SUCCESS, message: "Saved!", timeout: 1000});
        this.setState({isOpen: false, isDirty: false, minData: deepClone(this.props.minData)}, this.formatDisplay.bind(this));
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

  populateLanguageContent(minData) {
    const {fields, plainFields} = this.props;
    const {localeDefault, localeSecondary} = this.props.status;
    if (!minData.content.find(c => c.locale === localeDefault)) {
      // This is a rare edge case, but in some cases, the DEFAULT
      // Language is not populated. We must scaffold out a fake
      // Starting point with empty strings to base everything on.
      const defCon = {id: minData.id, locale: localeDefault};
      // If for any reason the default was missing fields, set it to a scaffold warning
      fields.forEach(k => !defCon[k] ? defCon[k] = "Missing Default Language Content!" : null);
      if (plainFields) plainFields.forEach(k => !defCon[k] ? defCon[k] = "" : null);
      minData.content.push(defCon);
    }
    if (!minData.content.find(c => c.locale === localeSecondary)) {
      const defCon = minData.content.find(c => c.locale === localeDefault);
      const newCon = {id: minData.id, locale: localeSecondary};
      if (defCon) {
        Object.keys(defCon).forEach(k => {
          if (k !== "id" && k !== "locale") newCon[k] = defCon[k];
        });
      }
      // If for any reason the default was missing fields, fill the rest with blanks
      fields.forEach(k => !newCon[k] ? newCon[k] = "" : null);
      if (plainFields) plainFields.forEach(k => !newCon[k] ? newCon[k] = "" : null);
      minData.content.push(newCon);
    }
    return minData;
  }

  markAsDirty() {
    const {isDirty} = this.state;
    if (!isDirty) this.setState({isDirty: true});
  }

  determineVariablesUsed() {
    const {minData} = this.state;
    return minData.content.reduce((acc, c) => {
      Object.keys(c).forEach(field => {
        if (c[field] && typeof c[field] === "string") {
          const matches = c[field].match(/\{\{([^\}]+)\}\}/g);
          if (matches) {
            matches.map(d => d.replace("{{", "").replace("}}", "")).forEach(match => {
              if (!acc.includes(match)) acc.push(match);
            });
          }
        }
      });
      return acc;
    }, []);
  }

  formatDisplay() {
    const {selectors} = this.props;
    const {localeDefault, localeSecondary, query} = this.props.status;
    const {formatterFunctions} = this.props.resources;
    // Stories use TextCards, but don't need variables.
    const variables = this.props.variables[localeDefault] || {};

    // For future use: This is a list of the vars used by this TextCard. Could combine with
    // Some selector replacing and create a quick way to open generators in the future.
    // const theseVars = this.determineVariablesUsed.bind(this)();

    const minData = this.populateLanguageContent.bind(this)(this.state.minData);

    // Setting "selectors" here is pretty hacky. The varSwap needs selectors in order
    // to run, and it expects them INSIDE the object. Find a better way to do this without
    // polluting the object itself. Don't forget to scaffold out dynamic selectors
    minData.allSelectors = selectors;

    const primaryFormatters = formatterFunctions[localeDefault];
    // Swap vars, and extract the actual (multilingual) content
    const content = varSwapRecursive(minData, primaryFormatters, variables, query).content;
    const primaryLang = content.find(c => c.locale === localeDefault);
    // Map over each of the default keys, and fetch its equivalent locale version (or default)
    const primaryDisplayData = {};
    if (primaryLang) {
      Object.keys(primaryLang).forEach(k => {
        primaryDisplayData[k] = primaryLang[k];
      });
    }

    let secondaryDisplayData = null;

    if (localeSecondary) {
      secondaryDisplayData = {};
      const secondaryFormatters = formatterFunctions[localeSecondary];
      const content = varSwapRecursive(minData, secondaryFormatters, variables, query).content;
      const secondaryLang = content.find(c => c.locale === localeSecondary);

      if (secondaryLang) {
        Object.keys(secondaryLang).forEach(k => {
          secondaryDisplayData[k] = secondaryLang[k];
        });
      }
    }

    this.setState({primaryDisplayData, secondaryDisplayData});
  }

  save() {
    const {type, fields, plainFields, hideAllowed} = this.props;
    const {localeDefault, localeSecondary} = this.props.status;
    const {minData} = this.state;
    const payload = {id: minData.id};

    const primaryLocale = minData.content.find(c => c.locale === localeDefault);
    // If a draftjs editor field ends with a trailing space, a &nbsp; is glommed onto the end of the field.
    // Before persisting this to the db, strip out the trailing space if necessary
    const stripTrail = d => typeof d === "string" ? d.replace(/\&nbsp;<\/p>/g, "</p>") : d;
    // Further, if a field is left blank, draftjs sees it as <p><br></p>. Don't write this to the DB either.
    const clearBlank = d => typeof d === "string" && d === "<p><br></p>" ? "" : d;
    const sanitize = d => clearBlank(stripTrail(d));
    fields.forEach(field => primaryLocale[field] = sanitize(primaryLocale[field]));
    if (plainFields) plainFields.forEach(field => primaryLocale[field] = sanitize(primaryLocale[field]));

    const secondaryLocale = minData.content.find(c => c.locale === localeSecondary);

    fields.forEach(field => secondaryLocale[field] = sanitize(secondaryLocale[field]));
    if (plainFields) plainFields.forEach(field => secondaryLocale[field] = sanitize(secondaryLocale[field]));
    // If hideAllowed is true, this TextCard is being used by a top-level Section, whose
    // allowed is controlled elsewhere. Don't accidentally pave it here.
    if (!hideAllowed) payload.allowed = minData.allowed;
    payload.content = localeSecondary ? [primaryLocale, secondaryLocale] : [primaryLocale];
    // note: isOpen will close on update success (see componentDidUpdate)
    this.props.updateEntity(type, payload);
  }

  maybeDelete() {
    const prettyType = this.prettifyType(this.props.type);
    const alertObj = {
      callback: this.delete.bind(this),
      title: `Delete ${prettyType}?`,
      confirm: `Delete ${prettyType}`
    };
    this.setState({alertObj});
  }

  delete() {
    const {type} = this.props;
    const {id} = this.props.minData;
    this.props.deleteEntity(type, {id});
  }

  openEditor() {
    const {type} = this.props;
    const minData = this.populateLanguageContent.bind(this)(deepClone(this.props.minData));
    const isOpen = true;
    this.props.setStatus({dialogOpen: {type, id: minData.id}});
    this.setState({minData, isOpen});
  }

  maybeCloseEditorWithoutSaving() {
    const {isDirty} = this.state;
    if (isDirty) {
      const alertObj = {
        callback: this.closeEditorWithoutSaving.bind(this),
        title: `Close ${this.prettifyType(this.props.type)} editor and revert changes?`,
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

  prettifyType(type) {
    return type.replace("story_", "").replace("section_", "").replace("description", "paragraph");
  }

  chooseVariable(e) {
    const {minData} = this.state;
    minData.allowed = e.target.value;
    this.setState({minData}, this.markAsDirty.bind(this));
  }

  render() {
    const {alertObj, primaryDisplayData, secondaryDisplayData, isOpen} = this.state;
    const {minData} = this.props;
    const {fields: richFields, hideAllowed, plainFields, type, showReorderButton} = this.props;
    const {localeDefault, localeSecondary, showToolbar} = this.props.status;
    // Stories use TextCards, but don't need variables.
    const variables = this.props.variables[localeDefault] || {};

    if (!minData || !primaryDisplayData) return <Loading />;

    const minDataState = this.state.minData;

    const entityList = ["profile", "section", "story", "storysection"];
    const availableFields = ["id", "locale", "image", "profile_id", "allowed", "date", "ordering", "slug", "type"];
    const displaySort = ["title", "value", "subtitle", "description", "tooltip", "short", "label"];

    const primaryDisplay = Object.keys(primaryDisplayData)
      .filter(k => typeof primaryDisplayData[k] === "string" && !availableFields.includes(k))
      .sort((a, b) => displaySort.indexOf(a) - displaySort.indexOf(b))
      .map(k => ({
        label: formatFieldName(k, upperCaseFirst(this.prettifyType(type))),
        text: stripHTML(primaryDisplayData[k])
      }));

    const secondaryDisplay = secondaryDisplayData ? Object.keys(secondaryDisplayData)
      .filter(k => typeof secondaryDisplayData[k] === "string" && !availableFields.includes(k))
      .sort((a, b) => displaySort.indexOf(a) - displaySort.indexOf(b))
      .map(k => ({
        label: formatFieldName(k, upperCaseFirst(this.prettifyType(type))),
        text: stripHTML(secondaryDisplayData[k])
      })) : [];

    // Find the first key that isn't empty in the display and use it as the title.
    let title = "";
    primaryDisplay.forEach(d => {
      if (!title && d.text) title = d.text;
    });
    if (!title) title = "Click to Edit";

    let allowed = true;
    if (minDataState) {
      allowed = !minDataState.allowed || minDataState.allowed === "always" || variables[minDataState.allowed];
    }

    // define props for Card
    const cardProps = {
      type,
      title,
      allowed,
      onEdit: this.openEditor.bind(this),
      onDelete: entityList.includes(type) ? false : this.maybeDelete.bind(this),
      // reorder
      reorderProps: showReorderButton ? {
        id: minData.id,
        type
      } : null,
      // alert
      alertObj,
      onAlertCancel: () => this.setState({alertObj: false})
    };

    const dialogProps = {
      className: "cms-text-editor-dialog",
      isOpen,
      onClose: this.maybeCloseEditorWithoutSaving.bind(this),
      title: type ? `${upperCaseFirst(this.prettifyType(type))} editor` : "Text editor",
      usePortal: false,
      onDelete: entityList.includes(type) ? false : this.maybeDelete.bind(this),
      onSave: this.save.bind(this),
      portalProps: {namespace: "cms"}
    };

    const editorProps = {
      contentType: type,
      data: minDataState,
      markAsDirty: this.markAsDirty.bind(this)
    };

    const richFieldsSorted = richFields ? richFields.sort((a, b) => displaySort.indexOf(a) - displaySort.indexOf(b)) : null;

    let selectProps = {};
    const showVars = Object.keys(variables).length > 0 && !hideAllowed;

    if (showVars) {
      selectProps = {
        label: "Visible",
        value: minDataState.allowed || "always",
        onChange: this.chooseVariable.bind(this),
        namespace: "cms",
        inline: true,
        children: [<option key="always" value="always">Always</option>]
          .concat(Object.keys(variables)
            .filter(key => !key.startsWith("_"))
            .sort((a, b) => a.localeCompare(b))
            .map(key => {
              const value = variables[key];
              const type = typeof value;
              const label = !["string", "number", "boolean"].includes(type) ? ` <i>(${type})</i>` : `: ${`${value}`.slice(0, 20)}${`${value}`.length > 20 ? "..." : ""}`;
              return <option key={key} value={key} dangerouslySetInnerHTML={{__html: `${key}${label}`}}></option>;
            })
          )
      };
    }

    return (
      <Card {...cardProps}>
        {/* preview content */}
        <div className="cms-locale-group">
          <div className="cms-locale-container">
            {localeSecondary &&
              <LocaleName locale={localeDefault} />
            }
            <DefinitionList definitions={primaryDisplay} />
          </div>

          {localeSecondary &&
            <div className="cms-locale-container">
              <LocaleName locale={localeSecondary} />
              <DefinitionList definitions={secondaryDisplay} />
            </div>
          }
        </div>

        {/* edit content */}
        <Dialog {...dialogProps}>
          <Switch
            alignIndicator={Alignment.RIGHT}
            className="cms-toolbar-switch u-font-xs"
            checked={showToolbar}
            label="Rich Formatting"
            onChange={e => this.props.setStatus({showToolbar: e.target.checked})}
          />
          <div className="cms-dialog-locale-group">
            {/* primary locale */}
            <div className="cms-dialog-locale-container">
              {/* primary locale indicator only needed when showing two locales */}
              {localeSecondary &&
                <LocaleName locale={localeDefault} key="i1" />
              }
              {plainFields &&
                <PlainTextEditor locale={localeDefault} fields={plainFields} key="p1" {...editorProps} />
              }
              {richFields &&
                <RichTextEditor locale={localeDefault} fields={richFieldsSorted} key="r1" {...editorProps} />
              }
            </div>

            {/* secondary locale */}
            {localeSecondary &&
              <div className="cms-dialog-locale-container">
                <LocaleName locale={localeSecondary} key="i2" />
                {plainFields &&
                  <PlainTextEditor locale={localeSecondary} fields={plainFields} key="p2" {...editorProps} />
                }
                {richFields &&
                  <RichTextEditor locale={localeSecondary} fields={richFieldsSorted} key="r2" {...editorProps} />
                }
              </div>
            }
          </div>

          {/* visibility */}
          {!hideAllowed &&
            <VisibleSelector
              variables={variables}
              value={minDataState.allowed !== undefined ? minDataState.allowed : "always"}
              onChange={this.chooseVariable.bind(this)}
            />
          }
        </Dialog>
      </Card>
    );
  }
}

TextCard.contextTypes = {
  toast: PropTypes.object
};

const mapStateToProps = state => ({
  variables: state.cms.variables,
  status: state.cms.status,
  resources: state.cms.resources,
  selectors: state.cms.status.currentPid ? state.cms.profiles.find(p => p.id === state.cms.status.currentPid).selectors : []
});

const mapDispatchToProps = dispatch => ({
  updateEntity: (type, payload) => dispatch(updateEntity(type, payload)),
  deleteEntity: (type, payload) => dispatch(deleteEntity(type, payload)),
  setStatus: status => dispatch(setStatus(status))
});

export default connect(mapStateToProps, mapDispatchToProps)(TextCard);
