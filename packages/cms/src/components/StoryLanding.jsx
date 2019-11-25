import React, {Component} from "react";
import {connect} from "react-redux";
import {fetchData} from "@datawheel/canon-core";
import "./Story.css";
import stripP from "../utils/formatters/stripP";

class StoryLanding extends Component {

  render() {

    const {stories} = this.props;

    return (
      <div id="StoryLanding">
        <h3>Stories</h3>
        <ul>
          {stories.map((story, i) => 
            <li key={`${story.slug}-${i}`}><a href={`/story/${story.slug}`}>{stripP(story.title)}</a></li>
          )}
        </ul>
      </div>
    );
  }

}

StoryLanding.need = [
  fetchData("stories", "/api/story")
];

export default connect(state => ({
  stories: state.data.stories
}))(StoryLanding);
