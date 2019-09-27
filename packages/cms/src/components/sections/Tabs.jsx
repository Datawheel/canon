import React, {Component} from "react";
import Viz from "../Viz/Viz";
// import {AnchorLink} from "@datawheel/canon-core";

import Button from "../fields/Button";
import ButtonGroup from "../fields/ButtonGroup";
import Selector from "./components/Selector";
import Parse from "./components/Parse";
import "./Section.css";

import "./Tabs.css";

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
    const {slug, title, heading, loading, filters, paragraphs, stats, sources, visualizations, vizHeadingLevel} = this.props;
    const selectors = filters || [];
    const {tabIndex} = this.state;

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

    const tabDescriptions = paragraphs.length === visualizations.length ? [paragraphs[tabIndex]] : paragraphs;

    const tabs = visualizations.map((d, i) => {
      let title;
      for (let x = 0; x < titleKeys.length; x++) {
        title = findKey(d.logic, titleKeys[x]);
        if (title) break;
      }
      return title || `Visualization ${i + 1}`;
    });

    return <div className={`cp-section-inner cp-${slug}-section-inner cp-tabs-section-inner`} ref={comp => this.section = comp}>
      {/* sidebar */}
      <div className="cp-section-content cp-tabs-section-caption">
        {heading}
        {filters}

        {tabs.length > 1 &&
          <React.Fragment>
            <p className="u-visually-hidden">Select visualization: </p>
            <ButtonGroup>
              {tabs.map((title, key) =>
                <Button
                  active={tabIndex === key}
                  fontSize="xxs"
                  key={key}
                  onClick={this.updateTabs.bind(this, key)}
                >
                  {title}
                </Button>
              )}
            </ButtonGroup>
          </React.Fragment>
        }

        {tabDescriptions && tabDescriptions.map((content, i) =>
          <Parse key={i}>
            {content.description}
          </Parse>
        )}

        {stats}
        {sources}
      </div>

      <div className={`cp-tabs-section-figure${
        visualizations.filter(viz => viz.logic_simple && viz.logic_simple.type === "Graphic").length ? " cp-graphic-viz-grid" : ""
      }`}>
        <Viz section={this} config={visualization} key={tabIndex} slug={slug} headingLevel={vizHeadingLevel} sectionTitle={title}  />
        {tabSelectors.length > 0 && <div className="cp-section-selectors">
          {tabSelectors && tabSelectors.map(selector => <Selector key={selector.id} {...selector} loading={loading} />)}
        </div>}
      </div>
    </div>;
  }
}
