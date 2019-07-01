import axios from "axios";
import React, {Component} from "react";

import Button from "../components/fields/Button";
import Panel from "../components/Panel";
import TextCard from "../components/cards/TextCard";
import Loading from "components/Loading";
import VisualizationCard from "../components/cards/VisualizationCard";

const propMap = {
  storytopic_stat: "stats",
  storytopic_description: "descriptions",
  storytopic_subtitle: "subtitles",
  storytopic_visualization: "visualizations"
};

class StorySectionEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null
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
    axios.get(`/api/cms/storytopic/get/${this.props.id}`).then(resp => {
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

  addItem(type) {
    const {minData} = this.state;
    const payload = {};
    payload.storytopic_id = minData.id;
    // todo: move this ordering out to axios (let the server concat it to the end)
    payload.ordering = minData[propMap[type]].length;
    axios.post(`/api/cms/${type}/new`, payload).then(resp => {
      if (resp.status === 200) {
        minData[propMap[type]].push({id: resp.data.id, ordering: resp.data.ordering});
        this.setState({minData});
      }
    });
  }

  save() {
    const {minData} = this.state;
    const payload = {id: minData.id, slug: minData.slug, type: minData.type};
    axios.post("/api/cms/storytopic/update", payload).then(() => {
      console.log("saved");
    });
  }

  onSave(minData) {
    const {localeDefault} = this.props;
    const defCon = minData.content.find(c => c.lang === localeDefault);
    const title = defCon && defCon.title ? defCon.title : minData.slug;
    if (this.props.reportSave) this.props.reportSave("storytopic", minData.id, title);
  }

  onMove() {
    this.forceUpdate();
  }

  onDelete(type, newArray) {
    const {minData} = this.state;
    minData[propMap[type]] = newArray;
    this.setState({minData});
  }

  render() {

    const {minData} = this.state;
    const {locale, localeDefault} = this.props;

    if (!minData) return <Loading />;

    const typeOptions = minData.types.map(t =>
      <option key={t} value={t}>{t}</option>
    );

    return (
      <div className="cms-editor-inner">

        {/* current story options */}
        <Panel
          title="Story section metadata"
          subtitle="Panel title"
          entity="title"
          cards={<TextCard
            item={minData}
            locale={localeDefault}
            localeDefault={localeDefault}
            fields={["title"]}
            type="storytopic"
            onSave={this.onSave.bind(this)}
            variables={{}}
          />}
          secondaryCards={locale &&
            <TextCard
              item={minData}
              locale={locale}
              localeDefault={localeDefault}
              fields={["title"]}
              type="storytopic"
              onSave={this.onSave.bind(this)}
              variables={{}}
            />
          }
        >
          <div className="cms-editor-header">
            {/* change slug */}
            <label className="bp3-label cms-slug">
              Story slug
              <div className="bp3-input-group">
                <input className="bp3-input" type="text" value={minData.slug} onChange={this.changeField.bind(this, "slug", false)}/>
                <Button onClick={this.save.bind(this)}>Rename</Button>
              </div>
            </label>
            <label className="bp3-label bp3-fill">
              Layout
              <div className="bp3-select">
                <select value={minData.type} onChange={this.changeField.bind(this, "type", true)}>
                  {typeOptions}
                </select>
              </div>
            </label>
          </div>
        </Panel>

        {/* subtitles */}
        <Panel
          title="Subtitles"
          entity="subtitle"
          addItem={this.addItem.bind(this, "storytopic_subtitle")}
          cards={minData.subtitles && minData.subtitles.map(s =>
            <TextCard
              key={s.id}
              item={s}
              locale={localeDefault}
              localeDefault={localeDefault}
              fields={["subtitle"]}
              type="storytopic_subtitle"
              onDelete={this.onDelete.bind(this)}
              variables={{}}
              parentArray={minData.subtitles}
              onMove={this.onMove.bind(this)}
            />
          )}
          secondaryCards={locale && minData.subtitles && minData.subtitles.map(s =>
            <TextCard
              key={s.id}
              locale={locale}
              localeDefault={localeDefault}
              item={s}
              fields={["subtitle"]}
              type="storytopic_subtitle"
              onDelete={this.onDelete.bind(this)}
              variables={{}}
              parentArray={minData.subtitles}
              onMove={this.onMove.bind(this)}
            />
          )}
        />

        {/* Stats */}
        <Panel
          title="Stats"
          entity="stat"
          addItem={this.addItem.bind(this, "storytopic_stat")}
          cards={ minData.stats && minData.stats.map(s =>
            <TextCard
              key={s.id}
              item={s}
              locale={localeDefault}
              localeDefault={localeDefault}
              fields={["title", "subtitle", "value", "tooltip"]}
              type="storytopic_stat"
              onDelete={this.onDelete.bind(this)}
              variables={{}}
              parentArray={minData.stats}
              onMove={this.onMove.bind(this)}
            />
          )}
          secondaryCards={locale && minData.stats && minData.stats.map(s =>
            <TextCard
              key={s.id}
              item={s}
              locale={locale}
              localeDefault={localeDefault}
              fields={["title", "subtitle", "value", "tooltip"]}
              type="storytopic_stat"
              onDelete={this.onDelete.bind(this)}
              variables={{}}
              parentArray={minData.stats}
              onMove={this.onMove.bind(this)}
            />
          )}
        />

        {/* Descriptions */}
        <Panel
          title="Descriptions"
          entity="description"
          addItem={this.addItem.bind(this, "storytopic_description")}
          cards={minData.descriptions && minData.descriptions.map(d =>
            <TextCard
              key={d.id}
              item={d}
              locale={localeDefault}
              localeDefault={localeDefault}
              fields={["description"]}
              type="storytopic_description"
              onDelete={this.onDelete.bind(this)}
              variables={{}}
              parentArray={minData.descriptions}
              onMove={this.onMove.bind(this)}
            />
          )}
          secondaryCards={locale && minData.descriptions && minData.descriptions.map(d =>
            <TextCard
              key={d.id}
              item={d}
              locale={locale}
              localeDefault={localeDefault}
              fields={["description"]}
              type="storytopic_description"
              onDelete={this.onDelete.bind(this)}
              variables={{}}
              parentArray={minData.descriptions}
              onMove={this.onMove.bind(this)}
            />
          )}
        />

        {/* visualizations */}

        <Panel
          title="Visualizations"
          entity="visualization"
          addItem={this.addItem.bind(this, "storytopic_visualization")}
          cards={minData.visualizations && minData.visualizations.map(v =>
            <VisualizationCard
              key={v.id}
              item={v}
              locale={locale}
              localeDefault={localeDefault}
              onDelete={this.onDelete.bind(this)}
              type="storytopic_visualization"
              variables={{}}
              parentArray={minData.visualizations}
              onMove={this.onMove.bind(this)}
            />
          )}
        />
      </div>
    );
  }
}

export default StorySectionEditor;
