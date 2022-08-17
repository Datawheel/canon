import React, {Component} from "react";
import PropTypes from "prop-types";
import {withNamespaces} from "react-i18next";

import {Select as BlueprintSelect} from "@blueprintjs/select";
import {MenuItem} from "@blueprintjs/core";

import stripHTML from "../../../utils/formatters/stripHTML";

import Button from "../../fields/Button";
import ButtonGroup from "../../fields/ButtonGroup";
import Select from "../../fields/Select";

class Selector extends Component {

  constructor(props) {
    super(props);
    this.state = {
      comparisons: typeof props.default === "string"
        ? props.default.split(",").filter(d => d.length)
        : props.default || [],
      activeValue: props.default
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.default !== this.props.default) {
      this.setState({
        comparisons: typeof this.props.default === "string"
          ? this.props.default.split(",").filter(d => d.length)
          : this.props.default || [],
        activeValue: this.props.default
      });
    }
  }

  onSelectorWrapper(name, value) {
    const {onSelector, variables, compVariables, comparison} = this.context;
    const isComparison = comparison && compVariables.id === variables.id;
    onSelector(name, value, isComparison);
  }

  addComparison(comparison) {
    const {comparisons} = this.state;
    const filteredComparison = comparisons.concat([comparison]);
    const {name} = this.props;
    this.onSelectorWrapper(name, filteredComparison);
  }

  removeComparison(option) {
    const {comparisons} = this.state;
    const filteredComparison = comparisons.filter(d => d !== option);
    const {name} = this.props;
    this.onSelectorWrapper(name, filteredComparison);
  }

  renderItem(item, {handleClick}) {
    const {comparisons} = this.state;
    const {variables} = this.context;
    const {options} = this.props;
    const labels = options.reduce((acc, d) => ({...acc, [d.option]: d.label}), {});
    const selected = comparisons.find(comparison => comparison === item);
    return selected ? null : <MenuItem
      shouldDismissPopover={true}
      onClick={handleClick}
      key={item}
      text={stripHTML(labels[item] || variables[item] || item)}/>;
  }

  render() {
    const {activeValue, comparisons} = this.state;
    const {print, variables} = this.context;
    const {fontSize, id, loading, options, name, selectCutoff, title, type, t} = this.props;
    const slug = `${name}-${id}`;
    const labels = options.reduce((acc, d) => ({...acc, [d.option]: d.label}), {});

    // multi select
    if (type === "multi") {
      return <div className={ `bp3-fill ${type === "multi" ? "" : "bp3-select"}` }>
        { title && <label htmlFor={slug}>{title}</label> }
        {comparisons && comparisons.length > 0 &&
          <div className="multi-list">
            { comparisons.map(d => <div key={d} className="multi-item bp3-tag bp3-tag-removable">
              { stripHTML(labels[d] || variables[d] || d) }
              <button aria-label={`${labels[d] || variables[d] || d} (remove)`} className="bp3-tag-remove" onClick={this.removeComparison.bind(this, d)} />
            </div>) }
          </div>
        }
        {!print && options && options.length && comparisons && comparisons.length >= 0 && comparisons.length !== options.length
          ? <BlueprintSelect name={slug}
            filterable={false}
            noResults={<MenuItem disabled text="No results." />}
            onItemSelect={this.addComparison.bind(this)}
            items={options.map(d => d.option)}
            itemRenderer={this.renderItem.bind(this)}>
            <button type="button" className="multi-add bp3-button bp3-icon-plus">
              {t("CMS.Selector.Add a Comparison")}
            </button>
          </BlueprintSelect>
          : null
        }
      </div>;
    }

    // single selector
    else if (options && options.length >= 2) {

      // only show selected option in print mode
      if (print) {
        const b = options.find(b => b.option === activeValue);
        if (!b) return null;
        return <ButtonGroup label={title} className="cp-selector-button-group" fontSize={fontSize}>
          <Button
            className="cp-selector-button"
            fill={false}
            fontSize={fontSize}
          >
            {stripHTML(b.label || variables[b.option])}
          </Button>
        </ButtonGroup>;
      }

      // options under selectCutoff; button group
      if (options.length <= selectCutoff && options.every(b => stripHTML(b.label || variables[b.option]).length < 40)) {
        return <ButtonGroup label={title} className="cp-selector-button-group" fontSize={fontSize}>
          {(print ? options.filter(b => b.option === activeValue) : options).map(b =>
            <Button
              className="cp-selector-button"
              onClick={() => this.onSelectorWrapper(name, b.option)}
              active={b.option === activeValue}
              fontSize={fontSize}
              key={b.option}
            >
              {stripHTML(b.label || variables[b.option])}
            </Button>
          )}
        </ButtonGroup>;
      }
      // options over selectCutoff; select menu
      return <Select
        label={title}
        inline
        fontSize={fontSize}
        id={slug}
        onChange={d => this.onSelectorWrapper(name, d.target.value)}
        disabled={loading}
        value={activeValue}
      >
        {options.map(o => <option value={o.option} key={o.option}>
          {stripHTML(o.label || variables[o.option])}
        </option>)}
      </Select>;
    }

    else return false;
  }
}

Selector.contextTypes = {
  onSelector: PropTypes.func,
  print: PropTypes.bool,
  variables: PropTypes.object,
  compVariables: PropTypes.object,
  comparison: PropTypes.bool
};

Selector.defaultProps = {
  fontSize: "xxs",
  selectCutoff: 3
};

export default withNamespaces()(Selector);
