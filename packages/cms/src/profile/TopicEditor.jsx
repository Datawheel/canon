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
    if (prevProps.preview !== this.props.preview) {
      this.hitDB.bind(this)(true);
    }
  }

  hitDB(force) {
    axios.get(`/api/cms/topic/get/${this.props.id}`).then(resp => {
      this.setState({minData: resp.data}, this.fetchVariables.bind(this, force));
    });
  }

  changeField(field, save, e) {
    const {minData} = this.state;
    minData[field] = e.target.value;
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
    if (this.props.reportSave) this.props.reportSave("topic", minData.id, minData.title);
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
    const slug = this.props.masterSlug;
    const id = this.props.preview;
    if (this.props.fetchVariables) {
      this.props.fetchVariables(slug, id, force, () => this.setState({recompiling: false}));
    }
  }

  render() {

    const {minData, recompiling} = this.state;
    const {variables, preview, children} = this.props;

    if (!minData || !variables) return <Loading />;

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
          <label className="pt-label cms-slug">
            Profile slug
            <div className="pt-input-group">
              <input className="pt-input" type="text" value={minData.slug} onChange={this.changeField.bind(this, "slug", false)}/>
              <button className="cms-button pt-button" onClick={this.save.bind(this)}>Rename</button>
            </div>
          </label>
          {/* visibility select */}
          <label className="pt-label pt-fill">
            Allowed
            <div className="pt-select">
              <select id="visibility-select" value={minData.allowed || "always"} onChange={this.changeField.bind(this, "allowed", true)}>
                {varOptions}
              </select>
            </div>
          </label>
          {/* layout select */}
          <label className="pt-label pt-fill">
            Layout
            <div className="pt-select">
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
        <div className="cms-card-list">
          <TextCard
            item={minData}
            fields={["title"]}
            onSave={this.onSave.bind(this)}
            type="topic"
            variables={variables}
          />
        </div>

        {/* subtitles */}
        <h2 className="cms-section-heading">
          Subtitles
          <button className="cms-button cms-section-heading-button" onClick={this.addItem.bind(this, "topic_subtitle")}>
            <span className="pt-icon pt-icon-plus" />
          </button>
        </h2>
        <div className="cms-card-list">
          { minData.subtitles && minData.subtitles.map(s =>
            <TextCard
              key={s.id}
              item={s}
              fields={["subtitle"]}
              type="topic_subtitle"
              onDelete={this.onDelete.bind(this)}
              variables={variables}
              selectors={minData.selectors.map(s => Object.assign({}, s))}
              parentArray={minData.subtitles}
              onMove={this.onMove.bind(this)}
            />
          )}
        </div>

        {/* subtitles */}
        <h2 className="cms-section-heading">
          Selectors
          <button className="cms-button cms-section-heading-button" onClick={this.addItem.bind(this, "selector")}>
            <span className="pt-icon pt-icon-plus" />
          </button>
        </h2>
        <div className="cms-card-list">
          { minData.selectors && minData.selectors.map(s =>
            <SelectorCard
              key={s.id}
              minData={s}
              type="selector"
              onSave={() => this.forceUpdate()}
              onDelete={this.onDelete.bind(this)}
              variables={variables}
              parentArray={minData.selectors}
              onMove={this.onMove.bind(this)}
            />
          )}
        </div>


        {/* stats */}
        <h2 className="cms-section-heading">
          Stats
          <button className="cms-button cms-section-heading-button" onClick={this.addItem.bind(this, "topic_stat")}>
            <span className="pt-icon pt-icon-plus" />
          </button>
        </h2>
        <div className="cms-card-list">
          { minData.stats && minData.stats.map(s =>
            <TextCard
              key={s.id}
              item={s}
              fields={["title", "subtitle", "value", "tooltip"]}
              type="topic_stat"
              onDelete={this.onDelete.bind(this)}
              variables={variables}
              selectors={minData.selectors.map(s => Object.assign({}, s))}
              parentArray={minData.stats}
              onMove={this.onMove.bind(this)}
            />
          )}
        </div>

        {/* descriptions */}
        <h2 className="cms-section-heading">
          Descriptions
          <button className="cms-button cms-section-heading-button" onClick={this.addItem.bind(this, "topic_description")}>
            <span className="pt-icon pt-icon-plus" />
          </button>
        </h2>
        <div className="cms-card-list">
          { minData.descriptions && minData.descriptions.map(d =>
            <TextCard
              key={d.id}
              item={d}
              fields={["description"]}
              type="topic_description"
              onDelete={this.onDelete.bind(this)}
              variables={variables}
              selectors={minData.selectors.map(s => Object.assign({}, s))}
              parentArray={minData.descriptions}
              onMove={this.onMove.bind(this)}
            />
          )}
        </div>

        {/* visualizations */}
        <h2 className="cms-section-heading">
          Visualizations
          <button className="cms-button cms-section-heading-button" onClick={this.addItem.bind(this, "topic_visualization")}>
            <span className="pt-icon pt-icon-plus" />
          </button>
        </h2>
        <div className="cms-card-list visualizations">
          { minData.visualizations && minData.visualizations.map(v =>
            <VisualizationCard
              key={v.id}
              item={v}
              preview={preview}
              onDelete={this.onDelete.bind(this)}
              type="topic_visualization"
              variables={variables}
              selectors={minData.selectors.map(s => Object.assign({}, s))}
              parentArray={minData.visualizations}
              onMove={this.onMove.bind(this)}
            />
          )}
        </div>
      </div>
    );
  }
}

TopicEditor.contextTypes = {
  formatters: PropTypes.object
};

export default TopicEditor;
