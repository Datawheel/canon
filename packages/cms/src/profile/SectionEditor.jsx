import React, {Component} from "react";
import {connect} from "react-redux";
import {Dialog, Icon} from "@blueprintjs/core";

import blueprintIcons from "../utils/blueprintIcons";
import deepClone from "../utils/deepClone";
import toSpacedCase from "../utils/formatters/toSpacedCase";

import ButtonGroup from "../components/fields/ButtonGroup";
import Select from "../components/fields/Select";
import TextButtonGroup from "../components/fields/TextButtonGroup";

import Deck from "../components/interface/Deck";
import PreviewHeader from "../components/interface/PreviewHeader";
import SelectorUsage from "../components/interface/SelectorUsage";

import TextCard from "../components/cards/TextCard";
import VisualizationCard from "../components/cards/VisualizationCard";

import ProfileRenderer from "../components/ProfileRenderer.jsx";

import {newEntity, updateEntity} from "../actions/profiles";
import {setStatus} from "../actions/status";

import "./SectionEditor.css";

class SectionEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null
    };
  }

  componentDidMount() {
    this.setState({minData: deepClone(this.props.minData)});
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.setState({minData: deepClone(this.props.minData)});
    }
  }

  // Strip leading/trailing spaces and URL-breaking characters
  urlPrep(str) {
    return str.replace(/^\s+|\s+$/gm, "").replace(/[^a-zA-ZÀ-ž0-9-\ _]/g, "");
  }

  changeField(field, save, e) {
    const {minData} = this.state;
    minData[field] = field === "slug" ? this.urlPrep(e.target.value) : e.target.value;
    save ? this.setState({minData}, this.save.bind(this)) : this.setState({minData});
  }

  selectButton(field, save, val) {
    const {minData} = this.state;
    minData[field] = val;
    save ? this.setState({minData}, this.save.bind(this)) : this.setState({minData});
  }

  addItem(type) {
    this.props.newEntity(type, {section_id: this.props.minData.id});
  }

  save() {
    const {minData} = this.state;
    const {id, slug, type, allowed, position, icon} = minData;
    const payload = {id, slug, type, allowed, position, icon};
    if (payload.icon === "none") payload.icon = "";
    this.props.updateEntity("section", payload);
  }

  render() {

    const {minData, allSelectors, formatters} = this.props;
    const {children} = this.props;
    const {variables, localeDefault, localeSecondary, useLocaleSecondary, sectionPreview} = this.props.status;

    const minDataState = this.state.minData;

    const dataLoaded = minData && minDataState;
    const varsLoaded = variables;
    const defLoaded = localeSecondary || variables && !localeSecondary && variables[localeDefault];
    const locLoaded = !localeSecondary || variables && localeSecondary && variables[localeDefault] && variables[localeSecondary];

    if (!dataLoaded) return null;

    const allLoaded = dataLoaded && varsLoaded && defLoaded && locLoaded;

    const varOptions = [<option key="always" value="always">Always</option>]
      .concat(Object.keys(variables[localeDefault] || {})
        .filter(key => !key.startsWith("_"))
        .sort((a, b) => a.localeCompare(b))
        .map(key => {
          const value = variables[localeDefault][key];
          const type = typeof value;
          const label = !["string", "number", "boolean"].includes(type) ? ` <i>(${type})</i>` : `: ${`${value}`.slice(0, 20)}${`${value}`.length > 20 ? "..." : ""}`;
          return <option key={key} value={key} dangerouslySetInnerHTML={{__html: `${key}${label}`}}></option>;
        }));

    const iconList = [<option key="none" value="none">None</option>]
      .concat(blueprintIcons.map(icon =>
        <option key={icon} value={icon}>{icon}</option>
      ));

    // remove Hero from available layouts
    let availableLayouts = minData.types.filter(l => l !== "Hero");
    // if this is the first section, add Hero layout to the front
    if (minData.ordering === 0) availableLayouts = ["Hero"].concat(availableLayouts);
    if (minData.position === "sticky") availableLayouts = ["Default"];

    const layouts = availableLayouts.map(l =>
      <option key={l} value={l}>
        {toSpacedCase(l)}
      </option>
    );

    const sectionProps = {
      profile: sectionPreview,  // The entire profile, filtered to a single section, as loaded in Header.jsx
      sectionID: minData.id,    // Limit the Profile and its onSelect reloads to the given sectionID
      formatters,               // The RAW formatters - ProfileRenderer handles turning them into Functions
      locale: useLocaleSecondary ? localeSecondary : localeDefault
    };

    return (
      <div className="cms-editor-inner">

        {/* dimensions */}
        {allLoaded && children}

        {/* section name */}
        {/* TODO: convert to fields */}
        <Deck
          title="Section metadata"
          subtitle="Title"
          entity="meta"
          cards={[
            <TextCard
              key="title-card"
              minData={minData}
              fields={["title", "short"]}
              type="section"
              hideAllowed={true}
            />
          ]}
        >
          {/* current section options */}
          <div className="cms-editor-header">
            {/* change slug */}
            <TextButtonGroup
              namespace="cms"
              inputProps={{
                label: "Slug",
                labelHidden: true,
                fontSize: "xs",
                inline: true,
                namespace: "cms",
                value: minDataState.slug,
                onChange: this.changeField.bind(this, "slug", false)
              }}
              buttonProps={{
                children: "Rename slug",
                fontSize: "xs",
                namespace: "cms",
                onClick: this.save.bind(this)
              }}
            />

            {/* visibility select */}
            <Select
              label="Visible"
              namespace="cms"
              fontSize="xs"
              inline
              value={minDataState.allowed || "always"}
              onChange={this.changeField.bind(this, "allowed", true)}
            >
              {varOptions}
            </Select>

            {/* icon select */}
            <Select
              label="Icon"
              namespace="cms"
              fontSize="xs"
              inline
              value={minDataState.icon || "none"}
              onChange={this.changeField.bind(this, "icon", true)}
            >
              {iconList}
            </Select>

            {/* layout select */}
            {minData.position !== "sticky" &&
              <Select
                label="Layout"
                inline
                namespace="cms"
                fontSize="xs"
                value={minDataState.type}
                onChange={this.changeField.bind(this, "type", true)}
              >
                {layouts}
              </Select>
            }

            {/* position select */}
            <label className="bp3-label">
              <span className="u-visually-hidden">Positioning</span>
              <ButtonGroup namespace="cms" buttons={[
                {
                  onClick: this.selectButton.bind(this, "position", true, "default"),
                  active: minDataState.position === "default",
                  namespace: "cms",
                  fontSize: "xs",
                  icon: "alignment-left",
                  iconPosition: "left",
                  children: "default"
                },
                {
                  onClick: this.selectButton.bind(this, "position", true, "sticky"),
                  active: minDataState.position === "sticky",
                  namespace: "cms",
                  fontSize: "xs",
                  icon: "alignment-top",
                  iconPosition: "left",
                  children: "sticky"
                },
                {
                  onClick: this.selectButton.bind(this, "position", true, "modal"),
                  active: minDataState.position === "modal",
                  namespace: "cms",
                  fontSize: "xs",
                  icon: "applications",
                  iconPosition: "left",
                  children: "modal"
                }
              ]} />
            </label>
          </div>
        </Deck>

        {/* subtitles */}
        {minData.position !== "sticky" &&
          <Deck
            title="Subtitles"
            entity="subtitle"
            addItem={this.addItem.bind(this, "section_subtitle")}
            cards={minData.subtitles && minData.subtitles.map(s =>
              <TextCard
                key={s.id}
                minData={s}
                fields={["subtitle"]}
                type="section_subtitle"
                showReorderButton={minData.subtitles[minData.subtitles.length - 1].id !== s.id}
              />
            )}
          />
        }

        {allSelectors && allSelectors.length > 0 && allLoaded &&
          <Deck title="Selector activation" entity="selectorUsage">
            <SelectorUsage
              key="selector-usage"
              minData={minData}
            />
          </Deck>
        }

        {/* hide fields that won't be used by sticky sections */}
        {minData.position !== "sticky" && <React.Fragment>
          {/* stats */}
          <Deck
            title="Stats"
            entity="stat"
            addItem={this.addItem.bind(this, "section_stat")}
            cards={minData.stats && minData.stats.map(s =>
              <TextCard
                key={s.id}
                minData={s}
                fields={["title", "subtitle", "value", "tooltip"]}
                type="section_stat"
                showReorderButton={minData.stats[minData.stats.length - 1].id !== s.id}
              />
            )}
          />

          {/* descriptions */}
          <Deck
            title="Paragraphs"
            entity="description"
            addItem={this.addItem.bind(this, "section_description")}
            cards={minData.descriptions && minData.descriptions.map(d =>
              <TextCard
                key={d.id}
                minData={d}
                fields={["description"]}
                type="section_description"
                showReorderButton={minData.descriptions[minData.descriptions.length - 1].id !== d.id}
              />
            )}
          />

          {/* visualizations */}
          <Deck
            title="Visualizations"
            entity="visualization"
            addItem={this.addItem.bind(this, "section_visualization")}
            cards={minData.visualizations && minData.visualizations.map(v =>
              <VisualizationCard
                key={v.id}
                minData={v}
                type="section_visualization"
                showReorderButton={minData.visualizations[minData.visualizations.length - 1].id !== v.id}
              />
            )}
          />

          {/* preview section dialog */}
          <Dialog
            isOpen={sectionPreview}
            onClose={() => this.props.setStatus({sectionPreview: null})}
          >
            <button className="cp-dialog-close-button" onClick={() => this.props.setStatus({sectionPreview: null})}>
              <Icon className="cp-dialog-close-button-icon" icon="cross" />
              <span className="u-visually-hidden">close section</span>
            </button>
            <PreviewHeader />
            <ProfileRenderer {...sectionProps} />
          </Dialog>
        </React.Fragment>}
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  status: state.cms.status,
  formatters: state.cms.formatters,
  resources: state.cms.resources,
  minData: state.cms.profiles.find(p => p.id === state.cms.status.currentPid).sections.find(s => s.id === ownProps.id),
  allSelectors: state.cms.profiles.find(p => p.id === state.cms.status.currentPid).selectors
});

const mapDispatchToProps = dispatch => ({
  newEntity: (type, payload) => dispatch(newEntity(type, payload)),
  updateEntity: (type, payload) => dispatch(updateEntity(type, payload)),
  setStatus: status => dispatch(setStatus(status))
});

export default connect(mapStateToProps, mapDispatchToProps)(SectionEditor);
