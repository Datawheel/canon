import React, {Component} from "react";
import PropTypes from "prop-types";
import * as d3plus from "d3plus-react";
import {SizeMe} from "react-sizeme";
import PercentageBar from "./PercentageBar";
import Table from "./Table";
import Options from "./Options";
import toKebabCase from "../../utils/formatters/toKebabCase";
import propify from "../../utils/d3plusPropify";
import Parse from "../sections/components/Parse";
import "./Viz.css";
import defaultConfig from "./defaultConfig";

const vizTypes = Object.assign({PercentageBar}, {Table}, d3plus);

class Viz extends Component {

  getChildContext() {
    const context = {...this.context};
    context.d3plus = {...defaultConfig, ...context.d3plus};
    return context;
  }

  analyzeData(resp) {
    const {updateSource} = this.context;
    if (updateSource && resp.source) updateSource(resp.source);
  }

  render() {
    const {sectionTitle} = this.props;
    const variables = this.props.variables || this.context.variables;
    const {onSetVariables} = this.context;
    // Window opening is only supported on front-end profiles. If onOpenModal didn't come through context,
    // then this Viz is in the CMS, so just replace it with a no-op.
    const onOpenModal = this.context.onOpenModal ? this.context.onOpenModal : d => d;
    const locale = this.props.locale || this.context.locale;

    // This Viz component may be embedded in two ways - as a VisualizationCard in the
    // CMS, or as an actual Viz on a front-end site. In the former case, formatters
    // is a lookup object of languages, so we must fetch the appropriate formatter set.
    // In the latter, the locale is passed in based on params and then used in propify.
    // Thus, we use a flat formatter list, passed down by Profile.jsx, not needing a
    // locale-nested format.
    const formatters = this.context.formatters[locale] || this.context.formatters;

    const {config, configOverride, context, className, debug, options, slug, section, showTitle, headingLevel} = this.props;
    const {id} = config;

    // clone config object to allow manipulation
    const actions = {onSetVariables, onOpenModal};
    const vizProps = propify(config.logic, formatters, variables, locale, id, actions);

    // If the result of propify has an "error" property, then the provided javascript was malformed and propify
    // caught an error. Instead of attempting to render the viz, simply show the error to the user.
    // If "debug" is set to true, this viz is being rendered in the CMS, and we can show the stacktrace directly.
    if (vizProps.error && debug) return <div>{`Error in Viz index: ${vizProps.error}`}</div>;
    // Note that if vizProps.error exists but debug is NOT true, we should still keep rendering, because propify
    // gave us a "stub" config with a user-friendly error message built in, so the front-end can see it.
    vizProps.config = Object.assign(vizProps.config, configOverride);

    // strip out the "type" from config
    const {type} = vizProps.config;
    delete vizProps.config.type;
    if (!type) return null;
    const Visualization = vizTypes[type];
    if (!Visualization) {
      return <div>{`${type} is not a valid Visualization Type`}</div>;
    }

    const title = vizProps.config.title;
    delete vizProps.config.title;

    const vizConfig = Object.assign({}, {locale}, vizProps.config);

    return <SizeMe render={({size}) =>
      <div className={ `${context}-viz-container${
        className ? ` ${className}` : ""
      }${
        type ? ` ${context}-${toKebabCase(type)}-viz-container` : ""
      }`}>
        {title && showTitle || options
          ? <div className={`${context}-viz-header`}>
            {title && showTitle
              ? <Parse El={headingLevel} className={`${context}-viz-title u-margin-top-off u-margin-bottom-off u-font-xs`}>
                {title}
              </Parse> : ""
            }
            {options && !vizProps.error
              ? <Options
                key="option-key"
                component={{section, viz: this}}
                data={ vizConfig.data }
                dataFormat={ vizProps.dataFormat }
                slug={ slug }
                title={ title || sectionTitle || slug }
                iconOnly={size && size.width < 320 ? true : false}
              /> : ""
            }
          </div> : ""
        }
        <div className={`${context}-viz-figure${vizConfig.height ? " with-explicit-height" : ""}`}>
          <Visualization
            key="viz-key"
            ref={ comp => this.viz = comp }
            className={`d3plus ${context}-viz ${context}-${toKebabCase(type)}-viz`}
            dataFormat={resp => (this.analyzeData.bind(this)(resp), vizProps.dataFormat(resp))}
            linksFormat={vizProps.linksFormat}
            nodesFormat={vizProps.nodesFormat}
            topojsonFormat={vizProps.topojsonFormat}
            config={{...vizConfig, variables}}
          />
        </div>
      </div>
    } />;
  }
}

Viz.childContextTypes = {
  d3plus: PropTypes.object,
  formatters: PropTypes.object,
  locale: PropTypes.string,
  onSetVariables: PropTypes.func,
  onOpenModal: PropTypes.func,
  updateSource: PropTypes.func,
  variables: PropTypes.object
};

Viz.contextTypes = {
  d3plus: PropTypes.object,
  formatters: PropTypes.object,
  locale: PropTypes.string,
  onSetVariables: PropTypes.func,
  onOpenModal: PropTypes.func,
  updateSource: PropTypes.func,
  variables: PropTypes.object
};

Viz.defaultProps = {
  className: "",
  config: {},
  configOverride: {},
  namespace: "cp",
  options: true,
  showTitle: true,
  headingLevel: "h3"
};

export default Viz;
