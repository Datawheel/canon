import React, {Component} from "react";
import Viz from "../Viz/index";
import {AnchorLink} from "@datawheel/canon-core";
import {nest} from "d3-collection";
import StatGroup from "../Viz/StatGroup";
import Selector from "./components/Selector";
import "./topic.css";

/** */
function findKey(str, key) {
  const regex = new RegExp(`${key}\\:[\\s]*\\"([^\\"]+)\\"`, "g");
  const match = regex.exec(str);
  if (match) return match[1];
  else return match;
}

const titleKeys = ["tab", "type"];

export default class Tabs extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tabIndex: 0
    };
  }

  updateTabs(tabIndex) {
    this.setState({tabIndex});
  }

  render() {
    const {contents, loading} = this.props;
    const {descriptions, selectors, slug, stats, subtitles, title, visualizations} = contents;
    const {tabIndex} = this.state;

    const statGroups = nest().key(d => d.title).entries(stats);

    const visualization = visualizations[tabIndex];
    const selectorConfig = visualization.logic.match(/selectors\:[\s]*(\[[^\]]+\])/);
    let tabSelectors;
    if (selectorConfig) {
      const selectorArray = JSON.parse(selectorConfig[1]);
      tabSelectors = selectors
        .filter(selector => selectorArray.includes(selector.name))
        .sort((a, b) => selectorArray.indexOf(a.name) - selectorArray.indexOf(b.name));
    }
    else {
      const selectorsPerViz = Math.ceil(selectors.length / visualizations.length);
      tabSelectors = selectors.slice(selectorsPerViz * tabIndex, selectorsPerViz * (tabIndex + 1));
    }

    const tabDescriptions = descriptions.length === visualizations.length ? [descriptions[tabIndex]] : descriptions;

    const tabs = visualizations.map((d, i) => {
      let title;
      for (let x = 0; x < titleKeys.length; x++) {
        title = findKey(d.logic, titleKeys[x]);
        if (title) break;
      }
      return title || `Visualization ${i + 1}`;
    });

    return <div className={ `topic ${slug} Tabs` }>
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
        { tabDescriptions.map((content, i) => <div key={i} className="topic-description" dangerouslySetInnerHTML={{__html: content.description}} />) }
        { tabs.length > 1 && <div className={`tab-group tab-${tabIndex}`}>
          { tabs.map((title, key) =>
            <button className={tabIndex === key ? "tab selected" : "tab"} key={key} onClick={this.updateTabs.bind(this, key)}>
              {title}
            </button>
          )}
        </div> }
      </div>
      <div className="topic-flex">
        { <Viz config={visualization} key={tabIndex} className="topic-visualization" title={ title } slug={ `${slug}_${tabIndex}` } /> }
        { tabSelectors.length > 0 && <div className="topic-selectors">
          { tabSelectors.map(selector => <Selector key={selector.id} {...selector} loading={loading} />) }
        </div> }
      </div>
    </div>;
  }

}
