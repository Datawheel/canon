import React, {Component} from "react";
import {connect} from "react-redux";
import Button from "../components/fields/Button";
import Select from "../components/fields/Select";
import Deck from "../components/interface/Deck";
import TextCard from "../components/cards/TextCard";
import Loading from "components/Loading";
import VisualizationCard from "../components/cards/VisualizationCard";
import SelectorUsage from "../components/interface/SelectorUsage";
import deepClone from "../utils/deepClone";

import {newEntity, updateEntity} from "../actions/profiles";

import {SELECTOR_TYPES} from "../utils/consts/cms";

class StorySectionEditor extends Component {

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

  addItem(type) {
    this.props.newEntity(type, {storysection_id: this.props.minData.id});
  }

  save() {
    const {minData} = this.state;
    const {id, slug, type, allowed, position} = minData;
    const payload = {id, slug, type, allowed, position};
    this.props.updateEntity("storysection", payload);
  }

  render() {

    const {allSelectors, minData, children, variables} = this.props;
    const {localeDefault, localeSecondary} = this.props.status;

    const minDataState = this.state.minData;

    if (!minData || !minDataState) return <Loading />;

    const dataLoaded = minData && minDataState;
    const varsLoaded = variables;
    const defLoaded = localeSecondary || variables && !localeSecondary && variables[localeDefault];
    const locLoaded = !localeSecondary || variables && localeSecondary && variables[localeDefault] && variables[localeSecondary];

    if (!dataLoaded) return <Loading />;

    const allLoaded = dataLoaded && varsLoaded && defLoaded && locLoaded;

    const typeOptions = minData.types.map(t =>
      <option key={t} value={t}>{t}</option>
    );

    return (
      <div className="cms-editor-inner">

        {/* header */}
        {children}

        {/* current story options */}
        <Deck
          title="Story section metadata"
          subtitle="Section title"
          entity="title"
          cards={<TextCard
            key="title-card"
            minData={minData}
            fields={["title"]}
            type="storysection"
          />}
        >
          <div className="cms-editor-header">
            {/* change slug */}
            <label className="bp3-label cms-slug">
              Story slug
              <div className="bp3-input-group">
                <input className="bp3-input" type="text" value={minDataState.slug} onChange={this.changeField.bind(this, "slug", false)}/>
                <Button namespace="cms" onClick={this.save.bind(this)}>Rename</Button>
              </div>
            </label>

            {/* layout select */}
            <Select
              label="Layout"
              namespace="cms"
              value={minDataState.type}
              onChange={this.changeField.bind(this, "type", true)}
            >
              {typeOptions}
            </Select>
          </div>
        </Deck>

        {/* subtitles */}
        <Deck
          title="Subtitles"
          entity="subtitle"
          addItem={this.addItem.bind(this, "storysection_subtitle")}
          cards={minData.subtitles && minData.subtitles.map(s =>
            <TextCard
              key={s.id}
              minData={s}
              fields={["subtitle"]}
              type="storysection_subtitle"
              showReorderButton={minData.subtitles[minData.subtitles.length - 1].id !== s.id}
            />
          )}
        />

        {allSelectors && allSelectors.length > 0 && allLoaded &&
          <Deck title="Selector activation" entity="selectorUsage">
            <SelectorUsage
              key="selector-usage"
              type={SELECTOR_TYPES.STORYSECTION_SELECTOR}
              minData={minData}
            />
          </Deck>
        }

        {/* Stats */}
        <Deck
          title="Stats"
          entity="stat"
          addItem={this.addItem.bind(this, "storysection_stat")}
          cards={ minData.stats && minData.stats.map(s =>
            <TextCard
              key={s.id}
              minData={s}
              fields={["title", "subtitle", "value", "tooltip"]}
              type="storysection_stat"
              showReorderButton={minData.stats[minData.stats.length - 1].id !== s.id}
            />
          )}
        />

        {/* Descriptions */}
        <Deck
          title="Descriptions"
          entity="description"
          addItem={this.addItem.bind(this, "storysection_description")}
          cards={minData.descriptions && minData.descriptions.map(d =>
            <TextCard
              key={d.id}
              minData={d}
              fields={["description"]}
              type="storysection_description"
              showReorderButton={minData.descriptions[minData.descriptions.length - 1].id !== d.id}
            />
          )}
        />

        {/* visualizations */}

        <Deck
          title="Visualizations"
          entity="visualization"
          addItem={this.addItem.bind(this, "storysection_visualization")}
          cards={minData.visualizations && minData.visualizations.map(v =>
            <VisualizationCard
              key={v.id}
              minData={v}
              type="storysection_visualization"
              showReorderButton={minData.visualizations[minData.visualizations.length - 1].id !== v.id}
            />
          )}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  variables: state.cms.variables,
  status: state.cms.status,
  minData: state.cms.stories.find(p => p.id === state.cms.status.currentStoryPid).storysections.find(s => s.id === ownProps.id),
  allSelectors: state.cms.stories.find(p => p.id === state.cms.status.currentStoryPid).selectors
});

const mapDispatchToProps = dispatch => ({
  newEntity: (type, payload) => dispatch(newEntity(type, payload)),
  updateEntity: (type, payload) => dispatch(updateEntity(type, payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(StorySectionEditor);
