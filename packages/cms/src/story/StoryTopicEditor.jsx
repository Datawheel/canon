import axios from "axios";
import React, {Component} from "react";
import {Button} from "@blueprintjs/core";
import Loading from "components/Loading";
import TextCard from "../components/cards/TextCard";
import VisualizationCard from "../components/cards/VisualizationCard";
import MoveButtons from "../components/MoveButtons";

const propMap = {
  storytopic_stat: "stats",
  storytopic_description: "descriptions",
  storytopic_subtitle: "subtitles",
  storytopic_visualization: "visualizations"
};

class StoryTopicEditor extends Component {

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

  changeField(field, save, e) {
    const {minData} = this.state;
    minData[field] = e.target.value;
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
    if (this.props.reportSave) this.props.reportSave("storytopic", minData.id, minData.title);
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

    if (!minData) return <Loading />;

    const typeOptions = minData.types.map(t =>
      <option key={t} value={t}>{t}</option>
    );

    return (
      <div className="cms-editor-inner">

        {/* layout select */}
        <div className="cms-editor-header">
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
            id={minData.id}
            fields={["title"]}
            plainfields={["image", "slug"]}
            type="story"
            onSave={this.onSave.bind(this)}
            variables={{}}
          />
        </div>

        {/* subtitles */}
        <h2 className="cms-section-heading">
          Subtitles
          <button className="cms-button cms-section-heading-button" onClick={this.addItem.bind(this, "storytopic_subtitle")}>
            <span className="pt-icon pt-icon-plus" />
          </button>
        </h2>
        <div className="cms-card-list">
          { minData.subtitles && minData.subtitles.map(s =>
            <TextCard
              key={s.id}
              id={s.id}
              fields={["subtitle"]}
              type="storytopic_subtitle"
              onDelete={this.onDelete.bind(this)}
              variables={{}}
            >
              <MoveButtons
                item={s}
                array={minData.subtitles}
                type="storytopic_subtitle"
                onMove={this.onMove.bind(this)}
              />
            </TextCard>
          )}
        </div>

        {/* stats */}
        <h2 className="cms-section-heading">
          Stats
          <button className="cms-button cms-section-heading-button" onClick={this.addItem.bind(this, "storytopic_stat")}>
            <span className="pt-icon pt-icon-plus" />
          </button>
        </h2>
        <div className="cms-card-list">
          { minData.stats && minData.stats.map(s =>
            <TextCard
              key={s.id}
              id={s.id}
              fields={["title", "subtitle", "value", "tooltip"]}
              type="storytopic_stat"
              onDelete={this.onDelete.bind(this)}
              variables={{}}
            >
              <MoveButtons
                item={s}
                array={minData.stats}
                type="storytopic_stat"
                onMove={this.onMove.bind(this)}
              />
            </TextCard>
          )}
        </div>

        {/* descriptions */}
        <h2 className="cms-section-heading">
          Descriptions
          <button className="cms-button cms-section-heading-button" onClick={this.addItem.bind(this, "storytopic_description")}>
            <span className="pt-icon pt-icon-plus" />
          </button>
        </h2>
        <div className="cms-card-list">
          { minData.descriptions && minData.descriptions.map(d =>
            <TextCard
              key={d.id}
              id={d.id}
              fields={["description"]}
              type="storytopic_description"
              onDelete={this.onDelete.bind(this)}
              variables={{}}
            >
              <MoveButtons
                item={d}
                array={minData.descriptions}
                type="storytopic_description"
                onMove={this.onMove.bind(this)}
              />
            </TextCard>
          )}
        </div>{/* visualizations */}
        <h2 className="cms-section-heading">
          Visualizations
          <button className="cms-button cms-section-heading-button" onClick={this.addItem.bind(this, "storytopic_visualization")}>
            <span className="pt-icon pt-icon-plus" />
          </button>
        </h2>
        <div className="cms-card-list visualizations">
          { minData.visualizations && minData.visualizations.map(v =>
            <VisualizationCard
              key={v.id}
              id={v.id}
              onDelete={this.onDelete.bind(this)}
              type="storytopic_visualization"
              variables={{}}
            >
              <MoveButtons
                item={v}
                array={minData.visualizations}
                type="storytopic_visualization"
                onMove={this.onMove.bind(this)}
              />
            </VisualizationCard>
          )}
        </div>
      </div>
    );
  }
}

export default StoryTopicEditor;
