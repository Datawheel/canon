import React, {Component} from "react";
import PropTypes from "prop-types";
import {AnchorLink} from "@datawheel/canon-core";
import {nest} from "d3-collection";
import StatGroup from "../Viz/StatGroup";
import Viz from "../Viz/index";
import "./topic.css";

class Card extends Component {

  render() {
    const {contents, loading} = this.props;
    const {onSelector, variables} = this.context;
    const {descriptions, selectors, slug, stats, subtitles, title, visualizations} = contents;

    const statGroups = nest().key(d => d.title).entries(stats);

    return <div className={ `topic pt-card pt-elevation-0 ${slug} Card` }>
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
        { selectors.map(selector => <div className="pt-select" key={selector.name}>
          <select onChange={d => onSelector(selector.name, d.target.value)} disabled={loading} defaultValue={selector.default}>
            { selector.options.map(({option}) => <option value={option} key={option}>{variables[option]}</option>) }
          </select>
        </div>) }
      </div> }
      <div className="topic-flex">
        { visualizations.length === 1 && selectors.length > 0 && <div className="topic-selectors">
          { selectors.map(selector => <div className="pt-select pt-fill" key={selector.name}>
            <select onChange={d => onSelector(selector.name, d.target.value)} disabled={loading} defaultValue={selector.default}>
              { selector.options.map(({option}) => <option value={option} key={option}>{variables[option]}</option>) }
            </select>
          </div>) }
        </div> }
        { visualizations.map((visualization, ii) => <Viz config={visualization} key={ii} className="topic-visualization" title={ title } slug={ `${slug}_${ii}` } />) }
      </div>
    </div>;
  }

}

Card.contextTypes = {
  onSelector: PropTypes.func,
  variables: PropTypes.object
};

export default Card;
