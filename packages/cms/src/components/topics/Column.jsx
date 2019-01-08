import React, {Component} from "react";
import Viz from "../Viz/index";
import {AnchorLink} from "@datawheel/canon-core";
import {nest} from "d3-collection";
import StatGroup from "../Viz/StatGroup";
import Selector from "./Components/Selector";
import "./topic.css";

export default class Column extends Component {

  render() {

    const {contents, loading} = this.props;
    const {descriptions, selectors, slug, stats, subtitles, title, visualizations} = contents;

    const statGroups = nest().key(d => d.title).entries(stats);

    return <div className={ `topic ${slug} Column` }>
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
      { visualizations.length > 1 && selectors.length > 0 && <div className="topic-selectors">
        { selectors.map(selector => <Selector key={selector.id} {...selector} loading={loading} />) }
      </div> }
      <div className="topic-flex">
        { visualizations.length === 1 && selectors.length > 0 && <div className="topic-selectors">
          { selectors.map(selector => <Selector key={selector.id} {...selector} loading={loading} />) }
        </div> }
        { visualizations.map((visualization, ii) => <Viz config={visualization} key={ii} className="topic-visualization" title={ title } slug={ `${slug}_${ii}` } />) }
      </div>
    </div>;

  }

}
