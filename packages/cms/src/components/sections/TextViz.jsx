import React, {Component} from "react";
import {AnchorLink} from "@datawheel/canon-core";
import {nest} from "d3-collection";
import {NonIdealState, Spinner} from "@blueprintjs/core";
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

    return <div className={ `section ${slug || ""} TextViz ${loading ? "section-loading" : ""}` } ref={ comp => this.section = comp }>
      <div className="section-content">
        { title &&
          <h3 className="section-title">
            <AnchorLink to={ slug } id={ slug } className="anchor" dangerouslySetInnerHTML={{__html: title}}></AnchorLink>
          </h3>
        }
        { subtitles.map((content, i) => <div key={i} className="section-subtitle" dangerouslySetInnerHTML={{__html: content.subtitle}} />) }
        { selectors.map(selector => <Selector key={selector.id} {...selector} loading={loading} />) }
        { stats.length > 0
          ? <div className="section-stats">
            { statGroups.map(({key, values}) => <StatGroup key={key} title={key} stats={values} />) }
          </div> : null }
        <div className="section-descriptions">
          { descriptions.map((content, i) => <div key={i} className="section-description" dangerouslySetInnerHTML={{__html: content.description}} />) }
          { loading && <NonIdealState visual={<Spinner />} /> }
        </div>
        { miniviz && <Viz section={this} config={miniviz} className="section-miniviz" title={ title } slug={ `${slug}_miniviz` } /> }
        <SourceGroup sources={sources} />
      </div>
      { mainviz.map((visualization, ii) => <Viz section={this} config={visualization} key={ii} className="section-visualization" title={ title } slug={ `${slug}_${ii}` } />) }
    </div>;

  }

}
