import React, {Component, Fragment} from "react";
import {hot} from "react-hot-loader/root";
import PropTypes from "prop-types";

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
      comparisons: props && props.default ? props.default.split(",").filter(d => d.length) : null
    };
  }

  addComparison(comparison) {
    const {comparisons} = this.state;
    const filteredComparison = comparisons.concat([comparison]);
    this.setState({comparisons: filteredComparison});
    const {onSelector} = this.context;
    const {name} = this.props;
    onSelector(name, filteredComparison);
  }

  removeComparison(option) {
    const {comparisons} = this.state;
    const filteredComparison = comparisons.filter(d => d !== option);
    this.setState({comparisons: filteredComparison});
    const {onSelector} = this.context;
    const {name} = this.props;
    onSelector(name, filteredComparison);
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
    const {comparisons} = this.state;
    const {onSelector, variables} = this.context;
    const {default: activeValue, fontSize, id, loading, options, name, selectCutoff, title, type} = this.props;
    const slug = `${name}-${id}`;
    const labels = options.reduce((acc, d) => ({...acc, [d.option]: d.label}), {});

    // multi select
    if (type === "multi") {
      return <div className={ `bp3-fill ${type === "multi" ? "" : "bp3-select"}` }>
        { title && <label htmlFor={slug}>{title}</label> }

        {comparisons && comparisons.length > 0 && <Fragment>
          <div className="multi-list">
            { comparisons.map(d => <div key={d} className="multi-item bp3-tag bp3-tag-removable">
              { stripHTML(labels[d] || variables[d] || d) }
              <button aria-label={`${labels[d] || variables[d] || d} (remove)`} className="bp3-tag-remove" onClick={this.removeComparison.bind(this, d)} />
            </div>) }
          </div>
          {options && options.length && comparisons.length !== options.length
            ? <BlueprintSelect name={slug}
              filterable={false}
              noResults={<MenuItem disabled text="No results." />}
              onItemSelect={this.addComparison.bind(this)}
              items={options.map(d => d.option)}
              itemRenderer={this.renderItem.bind(this)}>
              <button type="button" className="multi-add bp3-button bp3-icon-plus">
                Add a Comparison
              </button>
            </BlueprintSelect>
            : null }
        </Fragment>}
      </div>;
    }

    // single selector
    else if (options && options.length >= 2) {
      // options under selectCutoff; button group
      if (options.length <= selectCutoff) {
        return <ButtonGroup label={title} className="cp-selector-button-group" fontSize={fontSize}>
          {options.map(b =>
            <Button
              className="cp-selector-button"
              onClick={() => onSelector(name, b.option)}
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
        onChange={d => onSelector(name, d.target.value)}
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
  variables: PropTypes.object
};

Selector.defaultProps = {
  fontSize: "xxs",
  selectCutoff: 3
};

export default hot(Selector);
