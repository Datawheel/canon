import React, {Component} from "react";
import {Suggest} from "@blueprintjs/select";
import {Menu, MenuItem} from "@blueprintjs/core";
import {connect} from "react-redux";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import "./VariableSuggest.css";

class VariableSuggest extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      variables: []
    };
  }

  componentDidMount() {
    const {localeDefault} = this.props.status;
    const {variables, prependAlways} = this.props;
    const stub = prependAlways ? [{key: "always", value: "Always"}] : [];
    const options = this.props.options || Object.entries(variables[localeDefault])
      .filter(([key, value]) => !key.startsWith("_") && typeof value !== "object")
      .sort(([a], [b]) => a.localeCompare(b))
      .reduce((acc, [key, value]) => acc.concat({key, value: String(value)}), []);

    this.setState({variables: stub.concat(options)});
  }

  makeLabel(value) {
    const type = typeof value;
    return !["string", "number", "boolean"].includes(type) ? ` <i>(${type})</i>` : `${`${value}`.slice(0, 20)}${`${value}`.length > 20 ? "..." : ""}`;
  }

  renderVariable(item, {handleClick, modifiers}) {
    const {keyOnly} = this.props;
    if (!modifiers.matchesPredicate) return null;
    return (
      <MenuItem
        active={modifiers.active}
        disabled={modifiers.disabled}
        key={item.key}
        label={keyOnly ? "" : this.makeLabel(item.value)}
        onClick={handleClick}
        text={item.key}
      />
    );
  }

  filterVariables(query, variable) {
    return `${variable.key.toLowerCase()} ${String(variable.value).toLowerCase()}`.indexOf(query.toLowerCase()) >= 0;
  }

  renderList(list) {
    const {items, itemsParentRef, renderItem} = list;
    const CUTOFF = 200;
    const renderedItems = items.map(renderItem).filter(item => item !== null).slice(0, CUTOFF);
    return (
      <Menu ulRef={itemsParentRef}>
        {renderedItems}
      </Menu>
    );
  }

  render() {
    const {variables} = this.state;
    const {onItemSelect, value, keyOnly, fill} = this.props;
    const {localeDefault} = this.props.status;
    const selectedItem = {
      key: value, 
      value: value === "always" ? "Always" : String(this.props.variables[localeDefault][value])
    };

    return (
      <Suggest
        className="cms-variable-suggest"
        inputValueRenderer={variable => keyOnly ? variable.key : variable.key === "always" ? "Always" : `${variable.key}: ${variable.value}`}
        items={variables}
        itemRenderer={this.renderVariable.bind(this)}
        itemPredicate={this.filterVariables.bind(this)}
        itemListRenderer={this.renderList.bind(this)}
        itemsEqual="key"
        fill={fill}
        noResults={<MenuItem disabled={true} text="No results." />}
        selectedItem={selectedItem}
        onItemSelect={d => onItemSelect(d.key)}
        popoverProps={{
          minimal: false,
          modifiers: {
            arrow: {enabled: true}
          },
          position: "auto"
        }}
      />
    );
  }
}

VariableSuggest.defaultProps = {
  onItemSelect: d => d,
  fill: true
};

const mapStateToProps = state => ({
  variables: state.cms.variables,
  status: state.cms.status
});

export default connect(mapStateToProps)(VariableSuggest);
