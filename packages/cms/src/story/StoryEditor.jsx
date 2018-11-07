import axios from "axios";
import React, {Component} from "react";
import {Button} from "@blueprintjs/core";
import TextCard from "../components/cards/TextCard";
import MoveButtons from "../components/MoveButtons";
import Loading from "components/Loading";

const propMap = {
  author: "authors",
  story_description: "descriptions",
  story_footnote: "footnotes"
};

class StoryEditor extends Component {

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
    axios.get(`/api/cms/story/get/${this.props.id}`).then(resp => {
      this.setState({minData: resp.data});
    });
  }

  onSave(minData) {
    if (this.props.reportSave) this.props.reportSave("story", minData.id, minData.title);
  }

  save() {
    const {minData} = this.state;
    axios.post("/api/cms/story/update", minData).then(resp => {
      if (resp.status === 200) {
        console.log("saved");
      }
    });
  }

  onDelete(type, newArray) {
    const {minData} = this.state;
    minData[propMap[type]] = newArray;
    this.setState({minData});
  }

  addItem(type) {
    const {minData} = this.state;
    const payload = {};
    payload.story_id = minData.id;
    // todo: move this ordering out to axios (let the server concat it to the end)
    payload.ordering = minData[propMap[type]].length;
    axios.post(`/api/cms/${type}/new`, payload).then(resp => {
      if (resp.status === 200) {
        minData[propMap[type]].push({id: resp.data.id, ordering: resp.data.ordering});
        this.setState({minData});
      }
    });
  }

  onMove() {
    this.forceUpdate();
  }

  render() {

    const {minData} = this.state;

    if (!minData) return <Loading />;

    return (
      <div className="cms-editor-inner">

        {/* story name */}
        {/* TODO: move this to header */}
        <h2 className="cms-section-heading">
          Story
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

        {/* descriptions */}
        <h2 className="cms-section-heading">
          Descriptions
          <button className="cms-button cms-section-heading-button" onClick={this.addItem.bind(this, "story_description")}>
            <span className="pt-icon pt-icon-plus" />
          </button>
        </h2>
        <div className="cms-card-list">
          { minData.descriptions && minData.descriptions.map(d =>
            <TextCard key={d.id}
              id={d.id}
              onDelete={this.onDelete.bind(this)}
              fields={["description"]}
              type="story_description"
              variables={{}}
            >
              <MoveButtons
                item={d}
                array={minData.descriptions}
                type="story_description"
                onMove={this.onMove.bind(this)}
              />
            </TextCard>
          )}
        </div>

        {/* footnotes */}
        <h2 className="cms-section-heading">
          Footnotes
          <button className="cms-button cms-section-heading-button" onClick={this.addItem.bind(this, "story_footnote")}>
            <span className="pt-icon pt-icon-plus" />
          </button>
        </h2>
        <div className="cms-card-list">
          { minData.footnotes && minData.footnotes.map(d =>
            <TextCard key={d.id}
              id={d.id}
              ordering={d.ordering}
              onDelete={this.onDelete.bind(this)}
              fields={["description"]}
              type="story_footnote"
              variables={{}}
            >
              <MoveButtons
                item={d}
                array={minData.footnotes}
                type="story_footnote"
                onMove={this.onMove.bind(this)}
              />
            </TextCard>
          )}
        </div>

        {/* descriptions */}
        <h2 className="cms-section-heading">
          Authors
          <button className="cms-button cms-section-heading-button" onClick={this.addItem.bind(this, "author")}>
            <span className="pt-icon pt-icon-plus" />
          </button>
        </h2>
        <div className="cms-card-list">
          { minData.authors && minData.authors.map(d =>
            <TextCard key={d.id}
              id={d.id}
              onDelete={this.onDelete.bind(this)}
              fields={["bio"]}
              plainfields={["name", "title", "image", "twitter"]}
              type="author"
              variables={{}}
            >
              <MoveButtons
                item={d}
                array={minData.authors}
                type="author"
                onMove={this.onMove.bind(this)}
              />
            </TextCard>
          )}
        </div>
      </div>
    );
  }
}

export default StoryEditor;
