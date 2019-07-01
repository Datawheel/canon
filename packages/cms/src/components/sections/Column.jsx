import React, {Component} from "react";
import Viz from "../Viz/index";
import {AnchorLink} from "@datawheel/canon-core";
import {nest} from "d3-collection";
import StatGroup from "../Viz/StatGroup";
import Selector from "./components/Selector";
import "./Section.css";

export default class Column extends Component {

  render() {

    const {contents, loading} = this.props;
    const {descriptions, slug, stats, subtitles, title, visualizations} = contents;
    const selectors = contents.selectors || [];

    const statGroups = nest().key(d => d.title).entries(stats);

    return <div className={ `section ${slug} Column` } ref={ comp => this.section = comp }>
      <div className="section-content">
        { title &&
          <h3 className="section-title">
            <AnchorLink to={ slug } id={ slug } className="anchor" dangerouslySetInnerHTML={{__html: title}}></AnchorLink>
          </h3>
        }
        { subtitles.map((content, i) => <div key={i} className="section-subtitle" dangerouslySetInnerHTML={{__html: content.subtitle}} />) }
        { stats.length > 0
          ? <div className="section-stats">
            { statGroups.map(({key, values}) => <StatGroup key={key} title={key} stats={values} />) }
          </div> : null }
        { descriptions.map((content, i) => <div key={i} className="section-description" dangerouslySetInnerHTML={{__html: content.description}} />) }
      </div>
      { visualizations.length > 1 && selectors.length > 0 && <div className="section-selectors">
        { selectors.map(selector => <Selector key={selector.id} {...selector} loading={loading} />) }
      </div> }
      <div className="section-flex">
        { visualizations.length === 1 && selectors.length > 0 && <div className="section-selectors">
          { selectors.map(selector => <Selector key={selector.id} {...selector} loading={loading} />) }
        </div> }
        { visualizations.map((visualization, ii) => <Viz section={this} config={visualization} key={ii} className="section-visualization" title={ title } slug={ `${slug}_${ii}` } />) }
      </div>
    </div>;

  }

}
