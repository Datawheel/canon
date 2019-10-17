import React, {Component} from "react";
import PropTypes from "prop-types";
import * as d3plus from "d3plus-react";
import {SizeMe} from "react-sizeme";
import Graphic from "./Graphic";
import PercentageBar from "./PercentageBar";
import Table from "./Table";
import Options from "./Options";
import toKebabCase from "../../utils/formatters/toKebabCase";
import propify from "../../utils/d3plusPropify";
import Parse from "../sections/components/Parse";
import "./Viz.css";
import defaultConfig from "./defaultConfig";

const vizTypes = Object.assign({PercentageBar}, {Table}, {Graphic}, d3plus);

class Viz extends Component {

  constructor(props) {
    super(props);
    this.state = {
      // Snapshots of the variables that have been changed by onSetVariables
      // So we can reset these and only these to their original values.
      changedVariables: {}
    };
  }

  getChildContext() {
    const context = {...this.context};
    context.d3plus = {...defaultConfig, ...context.d3plus};
    return context;
  }

  analyzeData(resp) {
    const {updateSource} = this.context;
    if (updateSource && resp.source) updateSource(resp.source);
  }

  /**
   * Viz has received an onSetVariables function from context. However, this Viz needs to 
   * keep track locally of what it has changed, so that when a "reset" button is clicked, it can set
   * the variables back to their original state. This local intermediary function is responsible 
   * for keeping track of that, then calling the context version of the function.
   */
  onSetVariables(newVariables) {
    const initialVariables = this.props.initialVariables || this.context.initialVariables;
    const changedVariables = {};
    Object.keys(newVariables).forEach(key => {
      changedVariables[key] = initialVariables[key];
    });
    this.setState({changedVariables});
    this.context.onSetVariables(newVariables);
  }

  /**
   * When the user clicks reset, take the snapshot of the variables they changed and use them to 
   * revert only those variables via the context function. 
   */ 
  resetVariables() {
    const {changedVariables} = this.state;
    this.context.onSetVariables(changedVariables);
    this.setState({changedVariables: {}});
  }

  render() {
    const {sectionTitle} = this.props;
    const {changedVariables} = this.state;
    const showReset = Object.keys(changedVariables).length > 0;
    const variables = this.props.variables || this.context.variables;
    const onSetVariables = this.onSetVariables.bind(this);
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

    const {config, configOverride, namespace, className, debug, options, slug, section, showTitle, headingLevel} = this.props;
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
      <div className={ `${namespace}-viz-container${
        className ? ` ${className}` : ""
      }${
        type ? ` ${namespace}-${toKebabCase(type)}-viz-container` : ""
      }`}>
        {(title && showTitle || options) && type !== "Graphic"
          ? <div className={`${namespace}-viz-header`}>
            {title && showTitle
              ? <Parse El={headingLevel} className={`${namespace}-viz-title u-margin-top-off u-margin-bottom-off u-font-xs`}>
                {title}
              </Parse> : ""
            }
            {showReset && <button onClick={this.resetVariables.bind(this)}>Reset</button>}
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
        <div className={`${namespace}-viz-figure${vizConfig.height || type === "Graphic" ? " with-explicit-height" : ""}`}>
          <Visualization
            key="viz-key"
            ref={ comp => this.viz = comp }
            className={`d3plus ${namespace}-viz ${namespace}-${toKebabCase(type)}-viz`}
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
  // Though onSetVariables, onOpenModal, and intitialVariables aren't explicitly passed down,
  // they are required to be here because of the object spread in getChildContext.
  onSetVariables: PropTypes.func,
  onOpenModal: PropTypes.func,
  initialVariables: PropTypes.object,
  updateSource: PropTypes.func,
  variables: PropTypes.object
};

Viz.contextTypes = {
  d3plus: PropTypes.object,
  formatters: PropTypes.object,
  locale: PropTypes.string,
  onSetVariables: PropTypes.func,
  onOpenModal: PropTypes.func,
  initialVariables: PropTypes.object,
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
