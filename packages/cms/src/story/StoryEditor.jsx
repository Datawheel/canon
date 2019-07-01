import axios from "axios";
import React, {Component} from "react";
import Button from "../components/Button";
import Panel from "../components/Panel";
import TextCard from "../components/cards/TextCard";
import Loading from "components/Loading";
import {DatePicker} from "@blueprintjs/datetime";

import "@blueprintjs/datetime/lib/css/blueprint-datetime.css";

const propMap = {
  author: "authors",
  story_description: "descriptions",
  story_subtitle: "subtitles",
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
    const {localeDefault} = this.props;
    const defCon = minData.content.find(c => c.lang === localeDefault);
    const title = defCon && defCon.title ? defCon.title : minData.slug;
    if (this.props.reportSave) this.props.reportSave("story", minData.id, title);
  }

  setDate(date) {
    const {minData} = this.state;
    minData.date = date;
    this.setState({minData, showDate: false}, this.save.bind(this));
  }

  // Strip leading/trailing spaces and URL-breaking characters
  urlPrep(str) {
    return str.replace(/^\s+|\s+$/gm, "").replace(/[^a-zA-ZÀ-ž0-9-\ _]/g, "");
  }

  changeField(field, e) {
    const {minData} = this.state;
    minData[field] = field === "slug" ? this.urlPrep(e.target.value) : e.target.value;
    this.setState({minData});
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
    const {locale, localeDefault} = this.props;

    if (!minData) return <Loading />;

    return (
      <div className="cms-editor-inner">

        {/* current story options */}
        <Panel
          title="Story metadata"
          subtitle="Story title"
          entity="story"
          cards={<TextCard
            item={minData}
            locale={localeDefault}
            localeDefault={localeDefault}
            fields={["title", "subtitle"]}
            plainfields={["image"]}
            type="story"
            onSave={this.onSave.bind(this)}
            variables={{}}
          />}
          secondaryCards={locale &&
            <TextCard
              item={minData}
              locale={locale}
              localeDefault={localeDefault}
              fields={["title", "subtitle"]}
              plainfields={["image"]}
              type="story"
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
                <input className="bp3-input" type="text" value={minData.slug} onChange={this.changeField.bind(this, "slug")}/>
                <Button onClick={this.save.bind(this)}>Rename</Button>
              </div>
            </label>

            {/* publication date */}
            <div className="cms-date">
              <label htmlFor="date-picker" className="bp3-label">Date</label>
              <div className="data-picker-container">
                {new Date(minData.date).toDateString()} {!showDate &&
                  <button id="date-picker" onClick={() => this.setState({showDate: true})}>
                    Choose Date...
                  </button>
                }
                {showDate &&
                  <DatePicker value={new Date(minData.date)} onChange={this.setDate.bind(this)} />
                }
              </div>
            </div>
          </div>
        </Panel>

        {/* descriptions */}
        <Panel
          title="Descriptions"
          entity="description"
          addItem={this.addItem.bind(this, "story_description")}
          cards={minData.descriptions && minData.descriptions.map(d =>
            <TextCard key={d.id}
              item={d}
              locale={localeDefault}
              localeDefault={localeDefault}
              onDelete={this.onDelete.bind(this)}
              fields={["description"]}
              type="story_description"
              variables={{}}
              parentArray={minData.descriptions}
              onMove={this.onMove.bind(this)}
            />
          )}
          secondaryCards={locale && minData.descriptions && minData.descriptions.map(d =>
            <TextCard key={d.id}
              item={d}
              locale={locale}
              localeDefault={localeDefault}
              onDelete={this.onDelete.bind(this)}
              fields={["description"]}
              type="story_description"
              variables={{}}
              parentArray={minData.descriptions}
              onMove={this.onMove.bind(this)}
            />
          )}
        />


        {/* footnotes */}
        <Panel
          title="Footnotes"
          entity="footnote"
          addItem={this.addItem.bind(this, "story_footnote")}
          cards={minData.footnotes && minData.footnotes.map(d =>
            <TextCard key={d.id}
              item={d}
              locale={localeDefault}
              localeDefault={localeDefault}
              ordering={d.ordering}
              onDelete={this.onDelete.bind(this)}
              fields={["title", "description"]}
              type="story_footnote"
              variables={{}}
              parentArray={minData.footnotes}
              onMove={this.onMove.bind(this)}
            />
          )}
          secondaryCards={locale && minData.footnotes && minData.footnotes.map(d =>
            <TextCard key={d.id}
              item={d}
              locale={locale}
              localeDefault={localeDefault}
              ordering={d.ordering}
              onDelete={this.onDelete.bind(this)}
              fields={["title", "description"]}
              type="story_footnote"
              variables={{}}
              parentArray={minData.footnotes}
              onMove={this.onMove.bind(this)}
            />
          )}
        />


        {/* authors */}
        <Panel
          title="Authors"
          entity="author"
          addItem={this.addItem.bind(this, "author")}
          cards={minData.authors && minData.authors.map(d =>
            <TextCard key={d.id}
              item={d}
              locale={localeDefault}
              localeDefault={localeDefault}
              onDelete={this.onDelete.bind(this)}
              fields={["bio"]}
              plainfields={["name", "title", "image", "twitter"]}
              type="author"
              variables={{}}
              parentArray={minData.authors}
              onMove={this.onMove.bind(this)}
            />
          )}
          secondaryCards={locale && minData.authors && minData.authors.map(d =>
            <TextCard key={d.id}
              item={d}
              locale={locale}
              localeDefault={localeDefault}
              onDelete={this.onDelete.bind(this)}
              fields={["bio"]}
              plainfields={["name", "title", "image", "twitter"]}
              type="author"
              variables={{}}
              parentArray={minData.authors}
              onMove={this.onMove.bind(this)}
            />
          )}
        />
      </div>
    );
  }
}

export default StoryEditor;
