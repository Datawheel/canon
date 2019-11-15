import React, {Component} from "react";
import {connect} from "react-redux";
import Button from "../components/fields/Button";
import Deck from "../components/interface/Deck";
import TextCard from "../components/cards/TextCard";
import Loading from "components/Loading";
import {DatePicker} from "@blueprintjs/datetime";
import deepClone from "../utils/deepClone";

import {newEntity, updateEntity} from "../actions/profiles";

import "@blueprintjs/datetime/lib/css/blueprint-datetime.css";

class StoryEditor extends Component {

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

  addItem(type) {
    this.props.newEntity(type, {story_id: this.props.minData.id});
  }

  save() {
    const {minData} = this.state;
    const {id, slug, date} = minData;
    const payload = {id, slug, date};
    this.props.updateEntity("story", payload);
  }

  render() {

    const {showDate} = this.state;
    const {minData, children} = this.props;

    const minDataState = this.state.minData;

    if (!minData || !minDataState) return <Loading />;

    return (
      <div className="cms-editor-inner">

        {/* header */}
        {children}

        {/* current story options */}
        <Deck
          title="Story metadata"
          subtitle="Story title"
          entity="story"
          cards={<TextCard
            key="title-card"
            minData={minData}
            fields={["title", "subtitle"]}
            plainfields={["image"]}
            type="story"
          />}
        >
          <div className="cms-editor-header">
            {/* change slug */}
            <label className="bp3-label cms-slug">
              Story slug
              <div className="bp3-input-group">
                <input className="bp3-input" type="text" value={minDataState.slug} onChange={this.changeField.bind(this, "slug")}/>
                <Button namespace="cms" onClick={this.save.bind(this)}>Rename</Button>
              </div>
            </label>

            {/* publication date */}
            <div className="cms-date">
              <label htmlFor="date-picker" className="bp3-label">Date</label>
              <div className="data-picker-container">
                {new Date(minDataState.date).toDateString()} {!showDate &&
                  <button id="date-picker" onClick={() => this.setState({showDate: true})}>
                    Choose Date...
                  </button>
                }
                {showDate &&
                  <DatePicker value={new Date(minDataState.date)} onChange={this.setDate.bind(this)} />
                }
              </div>
            </div>
          </div>
        </Deck>

        {/* descriptions */}
        <Deck
          title="Paragraphs"
          entity="description"
          addItem={this.addItem.bind(this, "story_description")}
          cards={minData.descriptions && minData.descriptions.map(d =>
            <TextCard 
              key={d.id}
              minData={d}
              fields={["description"]}
              type="story_description"
              showReorderButton={minData.descriptions[minData.descriptions.length - 1].id !== d.id}
            />
          )}
        />

        {/* footnotes */}
        <Deck
          title="Footnotes"
          entity="footnote"
          addItem={this.addItem.bind(this, "story_footnote")}
          cards={minData.footnotes && minData.footnotes.map(d =>
            <TextCard 
              key={d.id}
              minData={d}
              fields={["title", "description"]}
              type="story_footnote"
              showReorderButton={minData.footnotes[minData.footnotes.length - 1].id !== d.id}
            />
          )}
        />

        {/* authors */}
        <Deck
          title="Authors"
          entity="author"
          addItem={this.addItem.bind(this, "author")}
          cards={minData.authors && minData.authors.map(d =>
            <TextCard 
              key={d.id}
              minData={d}
              fields={["bio"]}
              plainfields={["name", "title", "image", "twitter"]}
              type="author"
              showReorderButton={minData.authors[minData.authors.length - 1].id !== d.id}
            />
          )}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  status: state.cms.status,
  minData: state.cms.stories.find(p => p.id === ownProps.id)
});

const mapDispatchToProps = dispatch => ({
  newEntity: (type, payload) => dispatch(newEntity(type, payload)),
  updateEntity: (type, payload) => dispatch(updateEntity(type, payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(StoryEditor);
