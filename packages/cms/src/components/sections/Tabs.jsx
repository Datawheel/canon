import React, {Component, Fragment} from "react";
import {hot} from "react-hot-loader/root";

import toSpacedCase from "../../utils/formatters/toSpacedCase";
import upperCaseFirst from "../../utils/formatters/upperCaseFirst";

import Viz from "../Viz/Viz";
import Button from "../fields/Button";
import ButtonGroup from "../fields/ButtonGroup";
import Selector from "./components/Selector";
import Parse from "./components/Parse";
import "./Section.css";

import "./Tabs.css";

const titleKeys = ["tab", "type"];

/** js object keys can be wrapped in single/double quotes; strip those out so they can always be parsed */
function stripKeyQuotes(str, key) {
  return str.replace(`"${key}":`, `${key}:`).replace(`'${key}':`, `${key}:`);
}

/** config is a string; parse it */
function findKey(str, key) {
  const strippedStr = stripKeyQuotes(str, key); // defensive parsing
  const regex = new RegExp(`${key}\\:[\\s]*\\"([^\\"]+)\\"`, "g"); // /tab\:[\s]*\"([^\"]+)\"/g
  const match = regex.exec(strippedStr);
  if (match) return match[1];
  else return match;
}

class Tabs extends Component {

  constructor(props) {
    super(props);
    this.state = {
      panelIndex: 0
    };
  }

  updateTabs(panelIndex) {
    this.setState({panelIndex});
  }

  render() {
    const {slug, title, heading, loading, filters, paragraphs, stats, sources, visualizations, vizHeadingLevel} = this.props;
    const selectors = filters || [];
    const {panelIndex} = this.state;

    const visualization = visualizations[panelIndex];

    const selectorConfig = stripKeyQuotes(visualization.logic, "selectors").match(/selectors\:[\s]*(\[[^\]]+\])/);
    let tabSelectors;

    // custom selector list defined
    if (selectorConfig) {
      const selectorArray = JSON.parse(selectorConfig[1]);
      // console.log(selectorArray);
      tabSelectors = selectors
        .filter(selector => selectorArray.includes(selector.name))
        .sort((a, b) => selectorArray.indexOf(a.name) - selectorArray.indexOf(b.name));
    }
    else {
      const selectorsPerViz = Math.ceil(selectors.length / visualizations.length);
      tabSelectors = selectors.slice(selectorsPerViz * panelIndex, selectorsPerViz * (panelIndex + 1));
    }

    const tabDescriptions = paragraphs.length === visualizations.length ? [paragraphs[panelIndex]] : paragraphs;

    const tabs = visualizations.map((d, i) => {
      let title;
      // check viz config for button labels via "tab" or "type"
      for (let x = 0; x < titleKeys.length; x++) {
        title = findKey(d.logic, titleKeys[x]);
        if (title) return upperCaseFirst(toSpacedCase(title)); // convert LinePlot to Line plot
      }
      return title || `Visualization ${i + 1}`;
    });

    return <div className={`cp-section-inner cp-${slug}-section-inner cp-tabs-section-inner`} ref={comp => this.section = comp}>
      {/* sidebar */}
      <div className="cp-section-content cp-tabs-section-caption">
        {heading}
        {filters}

        {tabs.length > 1 &&
          <Fragment>
            <p className="u-visually-hidden">Select visualization: </p>
            <ButtonGroup>
              {tabs.map((title, key) =>
                <Button
                  active={panelIndex === key}
                  fontSize="xxs"
                  key={key}
                  onClick={this.updateTabs.bind(this, key)}
                >
                  {title}
                </Button>
              )}
            </ButtonGroup>
          </Fragment>
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
        <Viz section={this} config={visualization} key={panelIndex} slug={slug} headingLevel={vizHeadingLevel} sectionTitle={title}  />
        {tabSelectors.length > 0 && <div className="cp-section-selectors">
          {tabSelectors && tabSelectors.map(selector => <Selector key={selector.id} {...selector} loading={loading} />)}
        </div>}
      </div>
    </div>;
  }
}

export default hot(Tabs);
