import React, {Component} from "react";
import Viz from "../Viz/index";
// import {AnchorLink} from "@datawheel/canon-core";
import {nest} from "d3-collection";
import stripP from "../../utils/formatters/stripP";

import StatGroup from "../Viz/StatGroup";
import Selector from "./components/Selector";
import "./Section.css";

export default class Column extends Component {

  render() {

    const {contents, loading} = this.props;
    const {descriptions, slug, stats, subtitles, title, visualizations} = contents;
    const selectors = contents.selectors || [];

    const statGroups = nest().key(d => d.title).entries(stats);

    return <div className={ `cp-section-inner cp-${slug}-section-inner` } ref={ comp => this.section = comp }>
      <div className="cp-section-content">
        { title &&
          <h2 id={ slug } className="cp-section-title" dangerouslySetInnerHTML={{__html: stripP(title)}} />
        }
        { subtitles.map((content, i) => <div key={i} className="cp-section-subtitle" dangerouslySetInnerHTML={{__html: content.subtitle}} />) }
        { stats.length > 0
          ? <div className="cp-section-stats">
            { statGroups.map(({key, values}) => <StatGroup key={key} title={key} stats={values} />) }
          </div> : null }
        { descriptions.map((content, i) => <div key={i} className="cp-section-description" dangerouslySetInnerHTML={{__html: content.description}} />) }
      </div>
      { visualizations.length > 1 && selectors.length > 0 && <div className="cp-section-selectors">
        { selectors.map(selector => <Selector key={selector.id} {...selector} loading={loading} />) }
      </div> }
      <div className="cp-section-flex">
        { visualizations.length === 1 && selectors.length > 0 && <div className="cp-section-selectors">
          { selectors.map(selector => <Selector key={selector.id} {...selector} loading={loading} />) }
        </div> }
        { visualizations.map((visualization, ii) => <Viz section={this} config={visualization} key={ii} className="cp-section-visualization" title={ title } slug={ `${slug}_${ii}` } />) }
      </div>
    </div>;

  }

}
