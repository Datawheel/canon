import React, {Component} from "react";
// import {AnchorLink} from "@datawheel/canon-core";
import {nest} from "d3-collection";
import {NonIdealState, Spinner} from "@blueprintjs/core";
import stripP from "../../utils/formatters/stripP";

import Viz from "../Viz/index";
import SourceGroup from "../Viz/SourceGroup";
import StatGroup from "../Viz/StatGroup";
import Selector from "./components/Selector";
import "./Section.css";

export default class TextViz extends Component {

  render() {

    const {contents, loading, sources} = this.props;
    const {descriptions, slug, stats, subtitles, title, visualizations} = contents;
    const selectors = contents.selectors || [];

    const miniviz = visualizations.length > 1 ? visualizations[0] : false;
    const mainviz = visualizations.length > 1 ? visualizations.slice(1) : visualizations;

    const statGroups = nest().key(d => d.title).entries(stats);

    return <div className={ `cp-section-inner cp-${slug}-section-inner ${loading ? "is-loading" : ""}` } ref={ comp => this.section = comp }>
      <div className="cp-section-content">
        { title &&
          <h2 id={ slug } className="cp-section-title" dangerouslySetInnerHTML={{__html: stripP(title)}} />
        }
        { subtitles.map((content, i) => <div key={i} className="cp-section-subtitle" dangerouslySetInnerHTML={{__html: content.subtitle}} />) }
        { selectors.map(selector => <Selector key={selector.id} {...selector} loading={loading} />) }
        { stats.length > 0
          ? <div className="cp-section-stats">
            { statGroups.map(({key, values}) => <StatGroup key={key} title={key} stats={values} />) }
          </div> : null }
        <div className="cp-section-descriptions">
          { descriptions.map((content, i) => <div key={i} className="cp-section-description" dangerouslySetInnerHTML={{__html: content.description}} />) }
          { loading && <NonIdealState visual={<Spinner />} /> }
        </div>
        { miniviz && <Viz section={this} config={miniviz} className="cp-section-miniviz" title={ title } slug={ `${slug}_miniviz` } /> }
        <SourceGroup sources={sources} />
      </div>
      { mainviz.map((visualization, ii) => <Viz section={this} config={visualization} key={ii} className="cp-section-visualization" title={ title } slug={ `${slug}_${ii}` } />) }
    </div>;

  }

}
