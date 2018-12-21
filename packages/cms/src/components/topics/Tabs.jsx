import React, {Component} from "react";
import PropTypes from "prop-types";
import Viz from "../Viz/index";
import "./topic.css";

/** */
function findKey(str, key) {
  const regex = new RegExp(`${key}\\:[\\s]*\\"([^\\"]+)\\"`, "g");
  const match = regex.exec(str);
  if (match) return match[1];
  else return match;
}

class Tabs extends Component {

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
    const {onSelector, variables} = this.context;
    const {descriptions, selectors, slug, subtitles, title, visualizations} = contents;
    const {tabIndex} = this.state;

    const visualization = visualizations[tabIndex];
    const selectorsPerViz = Math.ceil(selectors.length / visualizations.length);
    const tabSelectors = selectors.slice(selectorsPerViz * tabIndex, selectorsPerViz * (tabIndex + 1));

    const titleKeys = ["tab", "type"];

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
            <a href={ `#${ slug }`} id={ slug } className="anchor" dangerouslySetInnerHTML={{__html: title}}></a>
          </h3>
        }
        { subtitles.map((content, i) => <div key={i} className="topic-subtitle" dangerouslySetInnerHTML={{__html: content.subtitle}} />) }
        { descriptions.map((content, i) => <div key={i} className="topic-description" dangerouslySetInnerHTML={{__html: content.description}} />) }
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
          { tabSelectors.map(selector => <div className="pt-select pt-fill" key={selector.name}>
            <select onChange={d => onSelector(selector.name, d.target.value)} disabled={loading} defaultValue={selector.default}>
              { selector.options.map(({option}) => <option value={option} key={option}>{variables[option]}</option>) }
            </select>
          </div>) }
        </div> }
      </div>
    </div>;
  }

}

Tabs.contextTypes = {
  onSelector: PropTypes.func,
  variables: PropTypes.object
};

export default Tabs;
