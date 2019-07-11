import axios from "axios";
import React, {Component} from "react";
import PropTypes from "prop-types";

import toSpacedCase from "../utils/formatters/toSpacedCase";

import Button from "../components/fields/Button";
import Select from "../components/fields/Select";
import ButtonGroup from "../components/fields/ButtonGroup";
import TextButtonGroup from "../components/fields/TextButtonGroup";
import TextCard from "../components/cards/TextCard";
import VisualizationCard from "../components/cards/VisualizationCard";
import Status from "../components/interface/Status";
import Accardion from "../components/interface/Accardion";
import SelectorUsage from "../components/interface/SelectorUsage";
import "./SectionEditor.css";

const propMap = {
  section_stat: "stats",
  section_description: "descriptions",
  section_subtitle: "subtitles",
  section_visualization: "visualizations",
  selectors: "selectors"
};

class SectionEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null,
      query: {}
    };
  }

  componentDidMount() {
    this.hitDB.bind(this)();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.hitDB.bind(this)();
    }
  }

  hitDB() {
    axios.get(`/api/cms/section/get/${this.props.id}`).then(resp => {
      this.setState({minData: resp.data});
    });
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

  // checkField(field, save, e) {
  //   const {minData} = this.state;
  //   minData[field] = e.target.checked;
  //   save ? this.setState({minData}, this.save.bind(this)) : this.setState({minData});
  // }

  selectButton(field, save, val) {
    const {minData} = this.state;
    minData[field] = val;
    save ? this.setState({minData}, this.save.bind(this)) : this.setState({minData});
  }

  addItem(type) {
    const {minData} = this.state;
    const payload = {};
    payload.section_id = minData.id;
    // todo: move this ordering out to axios (let the server concat it to the end)
    payload.ordering = minData[propMap[type]].length;
    axios.post(`/api/cms/${type}/new`, payload).then(resp => {
      if (resp.status === 200) {
        // Selectors, unlike the rest of the elements, actually do pass down their entire
        // content to the Card (the others are simply given an id and load the data themselves)
        // New selector will behave differently here
        if (type === "selector") {
          minData[propMap[type]].push(resp.data);
        }
        else {
          minData[propMap[type]].push({id: resp.data.id, ordering: resp.data.ordering});
        }
        this.setState({minData});
      }
    });
  }

  save() {
    const {minData} = this.state;
    const payload = {
      id: minData.id,
      slug: minData.slug,
      type: minData.type,
      allowed: minData.allowed,
      sticky: minData.sticky
    };
    axios.post("/api/cms/section/update", payload).then(resp => {
      if (resp.status === 200) {
        this.setState({isOpen: false});
      }
    });
  }

  onSave(minData) {
    const {localeDefault} = this.props;
    const defCon = minData.content.find(c => c.lang === localeDefault);
    const title = defCon && defCon.title ? defCon.title : minData.slug;
    if (this.props.reportSave) this.props.reportSave(minData.id, title);
  }

  onMove() {
    this.forceUpdate();
  }

  onSelect(selectionObj) {
    const {query} = this.state;
    const newQuery = Object.assign({}, query, selectionObj);
    this.setState({query: newQuery});
    if (this.props.onSelect) this.props.onSelect(newQuery);
  }

  onDelete(type, newArray) {
    const {minData} = this.state;
    minData[propMap[type]] = newArray;
    this.setState({minData});
  }

  render() {

    const {minData, recompiling, query} = this.state;
    const {variables, previews, selectors, children, locale, localeDefault, order} = this.props;

    const dataLoaded = minData;
    const varsLoaded = variables;
    const defLoaded = locale || variables && !locale && variables[localeDefault];
    const locLoaded = !locale || variables && locale && variables[localeDefault] && variables[locale];

    if (!dataLoaded || !varsLoaded || !defLoaded || !locLoaded) return false;

    const varOptions = [<option key="always" value="always">Always</option>]
      .concat(Object.keys(variables[localeDefault])
        .filter(key => !key.startsWith("_"))
        .sort((a, b) => a.localeCompare(b))
        .map(key => {
          const value = variables[localeDefault][key];
          const type = typeof value;
          const label = !["string", "number", "boolean"].includes(type) ? ` <i>(${type})</i>` : `: ${`${value}`.slice(0, 20)}${`${value}`.length > 20 ? "..." : ""}`;
          return <option key={key} value={key} dangerouslySetInnerHTML={{__html: `${key}${label}`}}></option>;
        }));

    // remove Hero from available layouts
    let availableLayouts = minData.types.filter(l => l !== "Hero");
    // if this is the first section, add Hero layout to the front
    if (order === 0) availableLayouts = ["Hero"].concat(availableLayouts);

    const layouts = availableLayouts.map(l =>
      <option key={l} value={l}>
        {toSpacedCase(l)}
      </option>
    );

    return (
      <div className="cms-editor-inner">

        {/* dimensions */}
        {children}

        {/* section name */}
        {/* TODO: convert to fields */}
        <Accardion
          title="Section metadata"
          subtitle="Title"
          entity="meta"
          cards={[
            <TextCard
              key="title-card"
              item={minData}
              locale={locale}
              localeDefault={localeDefault}
              fields={["title"]}
              query={query}
              onSave={this.onSave.bind(this)}
              type="section"
              selectors={minData.allSelectors.map(s => Object.assign({}, s))}
              variables={variables[localeDefault]}
              hideAllowed={true}
            />
          ]}
        >
          {/* current section options */}
          <div className="cms-editor-header">
            {/* change slug */}
            <TextButtonGroup
              context="cms"
              inputProps={{
                label: "Slug",
                labelHidden: true,
                fontSize: "xs",
                inline: true,
                context: "cms",
                value: minData.slug,
                onChange: this.changeField.bind(this, "slug", false)
              }}
              buttonProps={{
                children: "Rename slug",
                fontSize: "xs",
                context: "cms",
                onClick: this.save.bind(this)
              }}
            />

            {/* visibility select */}
            <Select
              label="Visible"
              context="cms"
              fontSize="xs"
              inline
              value={minData.allowed || "always"}
              onChange={this.changeField.bind(this, "allowed", true)}
            >
              {varOptions}
            </Select>

            {/* layout select */}
            <Select
              label="Layout"
              inline
              context="cms"
              fontSize="xs"
              value={minData.type}
              onChange={this.changeField.bind(this, "type", true)}
            >
              {layouts}
            </Select>

            {/* sticky select */}
            <label className="bp3-label">
              <span className="u-visually-hidden">Positioning</span>
              <ButtonGroup context="cms" buttons={[
                {
                  onClick: this.selectButton.bind(this, "sticky", true, false),
                  active: !minData.sticky,
                  context: "cms",
                  fontSize: "xs",
                  icon: "alignment-left",
                  iconPosition: "left",
                  children: "default"
                },
                {
                  onClick: this.selectButton.bind(this, "sticky", true, true),
                  active: minData.sticky,
                  context: "cms",
                  fontSize: "xs",
                  icon: "alignment-top",
                  iconPosition: "left",
                  children: "sticky"
                }
              ]} />
            </label>
          </div>
        </Accardion>

        {/* subtitles */}
        <Accardion
          title="Subtitles"
          entity="subtitle"
          addItem={this.addItem.bind(this, "section_subtitle")}
          cards={minData.subtitles && minData.subtitles.map(s =>
            <TextCard
              key={s.id}
              item={s}
              locale={locale}
              localeDefault={localeDefault}
              fields={["subtitle"]}
              query={query}
              type="section_subtitle"
              onDelete={this.onDelete.bind(this)}
              variables={variables[localeDefault]}
              selectors={minData.allSelectors.map(s => Object.assign({}, s))}
              parentArray={minData.subtitles}
              onMove={this.onMove.bind(this)}
            />
          )}
        />

        {selectors && selectors.length > 0 &&
          <Accardion title="Selector activation" entity="selectorUsage">
            <SelectorUsage
              key="selector-usage"
              minData={minData}
              variables={variables[localeDefault]}
              selectors={selectors}
              onSelect={this.onSelect.bind(this)}
            />
          </Accardion>
        }

        {/* stats */}
        <Accardion
          title="Stats"
          entity="stat"
          addItem={this.addItem.bind(this, "section_stat")}
          cards={minData.stats && minData.stats.map(s =>
            <TextCard
              key={s.id}
              item={s}
              locale={locale}
              localeDefault={localeDefault}
              fields={["title", "subtitle", "value", "tooltip"]}
              query={query}
              type="section_stat"
              onDelete={this.onDelete.bind(this)}
              variables={variables[localeDefault]}
              selectors={minData.allSelectors.map(s => Object.assign({}, s))}
              parentArray={minData.stats}
              onMove={this.onMove.bind(this)}
            />
          )}
        />

        {/* descriptions */}
        <Accardion
          title="Descriptions"
          entity="description"
          addItem={this.addItem.bind(this, "section_description")}
          cards={minData.descriptions && minData.descriptions.map(d =>
            <TextCard
              key={d.id}
              item={d}
              locale={locale}
              localeDefault={localeDefault}
              fields={["description"]}
              query={query}
              type="section_description"
              onDelete={this.onDelete.bind(this)}
              variables={variables[localeDefault]}
              selectors={minData.allSelectors.map(s => Object.assign({}, s))}
              parentArray={minData.descriptions}
              onMove={this.onMove.bind(this)}
            />
          )}
        />

        {/* visualizations */}
        <Accardion
          title="Visualizations"
          entity="visualization"
          addItem={this.addItem.bind(this, "section_visualization")}
          cards={minData.visualizations && minData.visualizations.map(v =>
            <VisualizationCard
              key={v.id}
              item={v}
              locale={localeDefault}
              localeDefault={localeDefault}
              secondaryLocale={locale}
              query={query}
              previews={previews}
              onDelete={this.onDelete.bind(this)}
              type="section_visualization"
              variables={variables[localeDefault]}
              secondaryVariables={variables[locale]}
              selectors={minData.allSelectors.map(s => Object.assign({}, s))}
              parentArray={minData.visualizations}
              onMove={this.onMove.bind(this)}
            />
          )}
        />

        {/* loading status */}
        <Status recompiling={recompiling} />
      </div>
    );
  }
}

SectionEditor.contextTypes = {
  formatters: PropTypes.object
};

export default SectionEditor;
