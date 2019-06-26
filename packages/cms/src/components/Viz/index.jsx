import React, {Component} from "react";
import PropTypes from "prop-types";
import * as d3plus from "d3plus-react";
import PercentageBar from "./PercentageBar";
import "./index.css";
import Options from "./Options";
import propify from "../../utils/d3plusPropify";

const vizTypes = Object.assign({PercentageBar}, d3plus);

class Viz extends Component {

  analyzeData(resp) {
    const {updateSource} = this.context;
    if (updateSource && resp.source) updateSource(resp.source);
  }

  render() {

    const variables = this.props.variables || this.context.variables;
    const locale = this.props.locale || this.context.locale;

    // This Viz component may be embedded in two ways - as a VisualizationCard in the
    // CMS, or as an actual Viz on a front-end site. In the former case, formatters
    // is a lookup object of languages, so we must fetch the appropriate formatter set.
    // In the latter, the locale is passed in based on params and then used in propify.
    // Thus, we use a flat formatter list, passed down by Profile.jsx, not needing a 
    // locale-nested format.    
    const formatters = this.context.formatters[locale] || this.context.formatters;

    const {config, configOverride, className, options, slug, topic} = this.props;
    const {id} = config;

    // clone config object to allow manipulation
    const vizProps = propify(config.logic, formatters, variables, locale, id);

    // If the result of propify has an "error" property, then the provided javascript was malformed and propify
    // caught an error. Instead of attempting to render the viz, simply show the error to the user.
    if (vizProps.error) {
      return <div>{`Error in Viz index: ${vizProps.error}`}</div>;
    }
    vizProps.config = Object.assign(vizProps.config, configOverride);

    // strip out the "type" from config
    const {type} = vizProps.config;
    delete vizProps.config.type;
    if (!type) return null;
    const Visualization = vizTypes[type];
    if (!Visualization) {
      return <div>{`${type} is not a valid Visualization Type`}</div>;
    }

    const title = (this.props.title || config.title || slug || "")
      .replace(/^<p>/g, "").replace(/<\/p>$/g, "");

    return <div className={ `visualization ${className}` }>
      { options ? <Options
        key="option-key"
        component={{topic, viz: this}}
        data={ vizProps.config.data }
        dataFormat={ vizProps.dataFormat }
        slug={ slug }
        title={ title } /> : null }
      <Visualization
        key="viz-key"
        ref={ comp => this.viz = comp }
        className="d3plus"
        dataFormat={resp => (this.analyzeData.bind(this)(resp), vizProps.dataFormat(resp))}
        config={vizProps.config} />
    </div>;
  }

}

Viz.contextTypes = {
  formatters: PropTypes.object,
  locale: PropTypes.string,
  updateSource: PropTypes.func,
  variables: PropTypes.object
};

Viz.defaultProps = {
  className: "",
  config: {},
  configOverride: {},
  options: true,
  title: undefined
};

export default Viz;
