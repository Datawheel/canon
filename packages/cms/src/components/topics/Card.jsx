import React, {Component} from "react";
import {AnchorLink} from "@datawheel/canon-core";
import {nest} from "d3-collection";
import StatGroup from "../Viz/StatGroup";
import Viz from "../Viz/index";
import Selector from "./components/Selector";
import "./topic.css";

export default class Card extends Component {

  render() {

    const {contents, loading} = this.props;
    const {descriptions, slug, stats, subtitles, title, visualizations} = contents;
    const selectors = contents.selectors || [];

    const statGroups = nest().key(d => d.title).entries(stats);

    return <div className={ `topic pt-card pt-elevation-0 ${slug} Card` } ref={ comp => this.topic = comp }>
      <div className="topic-content">
        { title &&
          <h3 className="topic-title">
            <AnchorLink to={ slug } id={ slug } className="anchor" dangerouslySetInnerHTML={{__html: title}}></AnchorLink>
          </h3>
        }
        { subtitles.map((content, i) => <div key={i} className="topic-subtitle" dangerouslySetInnerHTML={{__html: content.subtitle}} />) }
        { stats.length > 0
          ? <div className="topic-stats">
            { statGroups.map(({key, values}) => <StatGroup key={key} title={key} stats={values} />) }
          </div> : null }
        { descriptions.map((content, i) => <div key={i} className="topic-description" dangerouslySetInnerHTML={{__html: content.description}} />) }
      </div>
      { selectors.length > 0 && <div className="topic-selectors">
        { selectors.map(selector => <Selector key={selector.id} {...selector} loading={loading} />) }
      </div> }
      <div className="topic-flex">
        { visualizations.map((visualization, ii) => <Viz topic={this} config={visualization} key={ii} className="topic-visualization" title={ title } slug={ `${slug}_${ii}` } />) }
      </div>
    </div>;

  }

}
