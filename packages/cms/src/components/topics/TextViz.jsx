import React, {Component} from "react";
import PropTypes from "prop-types";
import {AnchorLink} from "@datawheel/canon-core";
import {nest} from "d3-collection";
import {NonIdealState, Spinner} from "@blueprintjs/core";
import Viz from "../Viz/index";
import SourceGroup from "../Viz/SourceGroup";
import StatGroup from "../Viz/StatGroup";
import "./topic.css";

class TextViz extends Component {

  render() {
    const {onSelector, variables} = this.context;
    const {contents, loading, sources} = this.props;
    const {descriptions, selectors, slug, stats, subtitles, title, visualizations} = contents;

    const miniviz = visualizations.length > 1 ? visualizations[0] : false;
    const mainviz = visualizations.length > 1 ? visualizations.slice(1) : visualizations;

    const statGroups = nest().key(d => d.title).entries(stats);

    return <div className={ `topic ${slug || ""} TextViz ${loading ? "topic-loading" : ""}` }>
      <div className="topic-content">
        { title &&
          <h3 className="topic-title">
            <AnchorLink to={ slug } id={ slug } className="anchor" dangerouslySetInnerHTML={{__html: title}}></AnchorLink>
          </h3>
        }
        { subtitles.map((content, i) => <div key={i} className="topic-subtitle" dangerouslySetInnerHTML={{__html: content.subtitle}} />) }
        { selectors.map(selector => <div className="pt-select pt-fill" key={selector.name}>
          <select onChange={d => onSelector(selector.name, d.target.value)} disabled={loading} defaultValue={selector.default}>
            { selector.options.map(({option}) => <option value={option} key={option}>{variables[option]}</option>) }
          </select>
        </div>) }
        <div className="topic-stats">
          { statGroups.map(({key, values}) => <StatGroup key={key} title={key} stats={values} />) }
        </div>
        <div className="topic-descriptions">
          { descriptions.map((content, i) => <div key={i} className="topic-description" dangerouslySetInnerHTML={{__html: content.description}} />) }
          { loading && <NonIdealState visual={<Spinner />} /> }
        </div>
        { miniviz && <Viz config={miniviz} className="topic-miniviz" title={ title } slug={ `${slug}_miniviz` } /> }
        <SourceGroup sources={sources} />
      </div>
      { mainviz.map((visualization, ii) => <Viz config={visualization} key={ii} className="topic-visualization" title={ title } slug={ `${slug}_${ii}` } />) }
    </div>;
  }

}

TextViz.contextTypes = {
  onSelector: PropTypes.func,
  variables: PropTypes.object
};

export default TextViz;
