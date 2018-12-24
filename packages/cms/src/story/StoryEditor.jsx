import axios from "axios";
import React, {Component} from "react";
import TextCard from "../components/cards/TextCard";
import Loading from "components/Loading";
import {DatePicker} from "@blueprintjs/datetime";

import "@blueprintjs/datetime/dist/blueprint-datetime.css";

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

  setDate(date) {
    const {minData} = this.state;
    minData.date = date;
    this.setState({minData, showDate: false}, this.save.bind(this));
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

    const {minData, showDate} = this.state;

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
            item={minData}
            fields={["title"]}
            plainfields={["image", "slug"]}
            type="story"
            onSave={this.onSave.bind(this)}
            variables={{}}
          />
        </div>

        <h2 className="cms-section-heading">
          Date
        </h2>
        <div className="cms-card-list">
          {new Date(minData.date).toDateString()}
          {!showDate && <button onClick={() => this.setState({showDate: true})}>Choose Date...</button>}
          {showDate && <DatePicker 
            value={new Date(minData.date)}
            onChange={this.setDate.bind(this)}
          />}
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
              item={d}
              onDelete={this.onDelete.bind(this)}
              fields={["description"]}
              type="story_description"
              variables={{}}
              parentArray={minData.descriptions}
              onMove={this.onMove.bind(this)}
            />
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
              item={d}
              ordering={d.ordering}
              onDelete={this.onDelete.bind(this)}
              fields={["title", "description"]}
              type="story_footnote"
              variables={{}}
              parentArray={minData.footnotes}
              onMove={this.onMove.bind(this)}
            />
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
              item={d}
              onDelete={this.onDelete.bind(this)}
              fields={["bio"]}
              plainfields={["name", "title", "image", "twitter"]}
              type="author"
              variables={{}}
              parentArray={minData.authors}
              onMove={this.onMove.bind(this)}
            />
          )}
        </div>
      </div>
    );
  }
}

export default StoryEditor;
