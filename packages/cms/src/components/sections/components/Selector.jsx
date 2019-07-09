import React, {Component} from "react";
import PropTypes from "prop-types";

import {Select as BlueprintSelect} from "@blueprintjs/select";
import {MenuItem, Icon} from "@blueprintjs/core";

import Select from "../../fields/Select";

class Selector extends Component {

  constructor(props) {
    super(props);
    this.state = {
      comparisons: props.default.split(",").filter(d => d.length)
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

  renderItem({handleClick, item}) {
    const {comparisons} = this.state;
    const {variables} = this.context;
    const selected = comparisons.find(comparison => comparison === item);
    return selected ? null : <MenuItem
      shouldDismissPopover={true}
      onClick={handleClick}
      key={item}
      text={variables[item]}/>;
  }

  render() {

    const {comparisons} = this.state;
    const {onSelector, variables} = this.context;
    const {default: defaultValue, id, loading, options, name, title, type} = this.props;
    const slug = `${name}-${id}`;

    return <div className="selector">
      {type === "multi"
        ? <div className={ `bp3-fill ${type === "multi" ? "" : "bp3-select"}` }>
          { title && <label htmlFor={slug}>{title}</label> }
          <div className="multi-list">
            { comparisons.map(d => <div key={d} className="multi-item bp3-tag bp3-tag-removable">
              { variables[d] }
              <button aria-label={`${variables[d]} (remove)`} className="bp3-tag-remove" onClick={this.removeComparison.bind(this, d)} />
            </div>) }
          </div>
          { comparisons.length !== options.length
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
        </div>

        : <Select
          label={title}
          inline
          id={slug}
          onChange={d => onSelector(name, d.target.value)}
          disabled={loading}
          value={defaultValue}
        >
          {options.map(({option}) => <option value={option} key={option}>
            {variables[option]}
          </option>)}
        </Select>
      }
    </div>;
  }

}

Selector.contextTypes = {
  onSelector: PropTypes.func,
  variables: PropTypes.object
};

export default Selector;
