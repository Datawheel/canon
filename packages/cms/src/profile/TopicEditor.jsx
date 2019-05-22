import axios from "axios";
import React, {Component} from "react";
import Loading from "components/Loading";
import {Icon} from "@blueprintjs/core";
import PropTypes from "prop-types";
import TextCard from "../components/cards/TextCard";
import SelectorCard from "../components/cards/SelectorCard";
import VisualizationCard from "../components/cards/VisualizationCard";
import "./TopicEditor.css";

const propMap = {
  topic_stat: "stats",
  topic_description: "descriptions",
  topic_subtitle: "subtitles",
  topic_visualization: "visualizations",
  selector: "selectors"
};

class TopicEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null
    };
  }

  componentDidMount() {
    this.hitDB.bind(this)(false);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.hitDB.bind(this)(false);
    }
    const prevSlugs = prevProps.previews.map(d => d.slug).join();
    const prevIDs = prevProps.previews.map(d => d.id).join();
    const newSlugs = this.props.previews.map(d => d.slug).join();
    const newIDs = this.props.previews.map(d => d.id).join();
    if (prevSlugs !== newSlugs || prevIDs !== newIDs) {
      this.hitDB.bind(this)(true);
    }
  }

  hitDB(force) {
    axios.get(`/api/cms/topic/get/${this.props.id}`).then(resp => {
      this.setState({minData: resp.data}, this.fetchVariables.bind(this, force));
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

  addItem(type) {
    const {minData} = this.state;
    const payload = {};
    payload.topic_id = minData.id;
    // todo: move this ordering out to axios (let the server concat it to the end)
    payload.ordering = minData[propMap[type]].length;
    axios.post(`/api/cms/${type}/new`, payload).then(resp => {
      if (resp.status === 200) {
        // Selectors, unlike the rest of the elements, actually do pass down their entire
        // content to the Card (the others are simply given an id and load the data themselves)
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
      allowed: minData.allowed
    };
    axios.post("/api/cms/topic/update", payload).then(resp => {
      if (resp.status === 200) {
        this.setState({isOpen: false});
      }
    });
  }

  onSave(minData) {
    const {localeDefault} = this.props;
    const defCon = minData.content.find(c => c.lang === localeDefault);
    const title = defCon && defCon.title ? defCon.title : minData.slug;
    if (this.props.reportSave) this.props.reportSave("topic", minData.id, title);
  }

  onMove() {
    this.forceUpdate();
  }

  onDelete(type, newArray) {
    const {minData} = this.state;
    minData[propMap[type]] = newArray;
    this.setState({minData});
  }

  fetchVariables(force) {
    if (this.props.fetchVariables) {
      this.props.fetchVariables(force, () => this.setState({recompiling: false}));
    }
  }

  render() {

    const {minData, recompiling} = this.state;
    const {variables, previews, children, locale, localeDefault} = this.props;

    const dataLoaded = minData;
    const varsLoaded = variables;
    const defLoaded = locale || variables && !locale && variables[localeDefault];
    const locLoaded = !locale || variables && locale && variables[localeDefault] && variables[locale];

    if (!dataLoaded || !varsLoaded || !defLoaded || !locLoaded) return <Loading />;

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

    const typeOptions = minData.types.map(t =>
      <option key={t} value={t}>{t}</option>
    );

    return (
      <div className="cms-editor-inner">
        {/* profile preview & variable status */}
        <div className="cms-profile-picker">
          {/* search profiles */}
          {children}
          {/* loading status */}
          <div className={recompiling ? "cms-status is-loading cms-alert-color" : "cms-status is-done"}>
            <Icon iconName={ recompiling ? "more" : "tick"} />
            { recompiling ? "Updating Variables" : "Variables Loaded" }
          </div>
        </div>
        {/* current topic options */}
        <div className="cms-editor-header">
          {/* change slug */}
          <label className="bp3-label cms-slug">
            Topic slug
            <div className="bp3-input-group">
              <input className="bp3-input" type="text" value={minData.slug} onChange={this.changeField.bind(this, "slug", false)}/>
              <button className="cms-button bp3-button" onClick={this.save.bind(this)}>Rename</button>
            </div>
          </label>
          {/* visibility select */}
          <label className="bp3-label bp3-fill">
            Allowed
            <div className="bp3-select">
              <select id="visibility-select" value={minData.allowed || "always"} onChange={this.changeField.bind(this, "allowed", true)}>
                {varOptions}
              </select>
            </div>
          </label>
          {/* layout select */}
          <label className="bp3-label bp3-fill">
            Layout
            <div className="bp3-select">
              <select value={minData.type} onChange={this.changeField.bind(this, "type", true)}>
                {typeOptions}
              </select>
            </div>
          </label>
        </div>

        {/* topic name */}
        {/* TODO: move this to header */}
        <h2 className="cms-section-heading">
          Topic title
        </h2>

        <div className="cms-card-container">
          {/* primary locale */}
          <div className="cms-card-list">
            <TextCard
              item={minData}
              locale={localeDefault}
              localeDefault={localeDefault}
              fields={["title"]}
              onSave={this.onSave.bind(this)}
              type="topic"
              variables={variables[localeDefault]}
            />
          </div>
          {/* secondary locale */}
          {locale &&
            <div className="cms-card-list">
              <TextCard
                item={minData}
                locale={locale}
                localeDefault={localeDefault}
                fields={["title"]}
                onSave={this.onSave.bind(this)}
                type="topic"
                variables={variables[locale]}
              />
            </div>
          }
        </div>


        {/* subtitles */}
        <h2 className="cms-section-heading">
          Subtitles
          <button className="cms-button cms-section-heading-button" onClick={this.addItem.bind(this, "topic_subtitle")}>
            <span className="bp3-icon bp3-icon-plus" />
          </button>
        </h2>

        <div className="cms-card-container">
          {/* primary locale */}
          <div className="cms-card-list">
            { minData.subtitles && minData.subtitles.map(s =>
              <TextCard
                key={s.id}
                item={s}
                locale={localeDefault}
                localeDefault={localeDefault}
                fields={["subtitle"]}
                type="topic_subtitle"
                onDelete={this.onDelete.bind(this)}
                variables={variables[localeDefault]}
                selectors={minData.selectors.map(s => Object.assign({}, s))}
                parentArray={minData.subtitles}
                onMove={this.onMove.bind(this)}
              />
            )}
          </div>
          {/* secondary locale */}
          {locale &&
            <div className="cms-card-list">
              { minData.subtitles && minData.subtitles.map(s =>
                <TextCard
                  key={s.id}
                  item={s}
                  locale={locale}
                  localeDefault={localeDefault}
                  fields={["subtitle"]}
                  type="topic_subtitle"
                  onDelete={this.onDelete.bind(this)}
                  variables={variables[locale]}
                  selectors={minData.selectors.map(s => Object.assign({}, s))}
                  parentArray={minData.subtitles}
                  onMove={this.onMove.bind(this)}
                />
              )}
            </div>
          }
        </div>

        {/* subtitles */}
        <h2 className="cms-section-heading">
          Selectors
          <button className="cms-button cms-section-heading-button" onClick={this.addItem.bind(this, "selector")}>
            <span className="bp3-icon bp3-icon-plus" />
          </button>
        </h2>

        <div className="cms-card-list">
          { minData.selectors && minData.selectors.map(s =>
            <SelectorCard
              key={s.id}
              minData={s}
              type="selector"
              locale={localeDefault}
              onSave={() => this.forceUpdate()}
              onDelete={this.onDelete.bind(this)}
              variables={variables[localeDefault]}
              parentArray={minData.selectors}
              onMove={this.onMove.bind(this)}
            />
          )}
        </div>

        {/* stats */}
        <h2 className="cms-section-heading">
          Stats
          <button className="cms-button cms-section-heading-button" onClick={this.addItem.bind(this, "topic_stat")}>
            <span className="bp3-icon bp3-icon-plus" />
          </button>
        </h2>

        <div className="cms-card-container">
          {/* primary locale */}
          <div className="cms-card-list">
            { minData.stats && minData.stats.map(s =>
              <TextCard
                key={s.id}
                item={s}
                locale={localeDefault}
                localeDefault={localeDefault}
                fields={["title", "subtitle", "value", "tooltip"]}
                type="topic_stat"
                onDelete={this.onDelete.bind(this)}
                variables={variables[localeDefault]}
                selectors={minData.selectors.map(s => Object.assign({}, s))}
                parentArray={minData.stats}
                onMove={this.onMove.bind(this)}
              />
            )}
          </div>
          {/* secondary locale */}
          {locale &&
            <div className="cms-card-list">
              { minData.stats && minData.stats.map(s =>
                <TextCard
                  key={s.id}
                  item={s}
                  locale={locale}
                  localeDefault={localeDefault}
                  fields={["title", "subtitle", "value", "tooltip"]}
                  type="topic_stat"
                  onDelete={this.onDelete.bind(this)}
                  variables={variables[locale]}
                  selectors={minData.selectors.map(s => Object.assign({}, s))}
                  parentArray={minData.stats}
                  onMove={this.onMove.bind(this)}
                />
              )}
            </div>
          }
        </div>


        {/* descriptions */}
        <h2 className="cms-section-heading">
          Descriptions
          <button className="cms-button cms-section-heading-button" onClick={this.addItem.bind(this, "topic_description")}>
            <span className="bp3-icon bp3-icon-plus" />
          </button>
        </h2>

        <div className="cms-card-container">
          {/* primary locale */}
          <div className="cms-card-list">
            { minData.descriptions && minData.descriptions.map(d =>
              <TextCard
                key={d.id}
                item={d}
                locale={localeDefault}
                localeDefault={localeDefault}
                fields={["description"]}
                type="topic_description"
                onDelete={this.onDelete.bind(this)}
                variables={variables[localeDefault]}
                selectors={minData.selectors.map(s => Object.assign({}, s))}
                parentArray={minData.descriptions}
                onMove={this.onMove.bind(this)}
              />
            )}
          </div>
          {/* secondary locale */}
          {locale &&
            <div className="cms-card-list">
              { minData.descriptions && minData.descriptions.map(d =>
                <TextCard
                  key={d.id}
                  item={d}
                  locale={locale}
                  localeDefault={localeDefault}
                  fields={["description"]}
                  type="topic_description"
                  onDelete={this.onDelete.bind(this)}
                  variables={variables[locale]}
                  selectors={minData.selectors.map(s => Object.assign({}, s))}
                  parentArray={minData.descriptions}
                  onMove={this.onMove.bind(this)}
                />
              )}
            </div>
          }
        </div>

        {/* visualizations */}
        <h2 className="cms-section-heading">
          Visualizations
          <button className="cms-button cms-section-heading-button" onClick={this.addItem.bind(this, "topic_visualization")}>
            <span className="bp3-icon bp3-icon-plus" />
          </button>
        </h2>

        <div className="cms-card-container">
          {/* primary locale */}
          <div className="cms-card-list visualizations">
            { minData.visualizations && minData.visualizations.map(v =>
              <VisualizationCard
                key={v.id}
                item={v}
                locale={localeDefault}
                localeDefault={localeDefault}
                previews={previews}
                onDelete={this.onDelete.bind(this)}
                type="topic_visualization"
                variables={variables[localeDefault]}
                selectors={minData.selectors.map(s => Object.assign({}, s))}
                parentArray={minData.visualizations}
                onMove={this.onMove.bind(this)}
              />
            )}
          </div>
          {/* secondary locale */}
          {locale &&
            <div className="cms-card-list visualizations">
              { minData.visualizations && minData.visualizations.map(v =>
                <VisualizationCard
                  key={v.id}
                  item={v}
                  locale={locale}
                  localeDefault={localeDefault}
                  previews={previews}
                  onDelete={this.onDelete.bind(this)}
                  type="topic_visualization"
                  variables={variables[locale]}
                  selectors={minData.selectors.map(s => Object.assign({}, s))}
                  parentArray={minData.visualizations}
                  onMove={this.onMove.bind(this)}
                />
              )}
            </div>
          }
        </div>
      </div>
    );
  }
}

TopicEditor.contextTypes = {
  formatters: PropTypes.object
};

export default TopicEditor;
