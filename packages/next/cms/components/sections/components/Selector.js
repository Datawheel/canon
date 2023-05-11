/* eslint-disable require-jsdoc */
/* eslint-disable react/destructuring-assignment */
import React, {useContext} from "react";

import {
  SegmentedControl, Select, Stack, Text
} from "@mantine/core";
import stripHTML from "../../../utils/formatters/stripHTML";

// import Button from "../../fields/Button";
// import ButtonGroup from "../../fields/ButtonGroup";
// import Select from "../../fields/Select";
import ProfileContext from "../../ProfileContext";

export default function Selector(props) {
  const {
    fontSize, id, loading, options, name, selectCutoff = 3, title, type, t
  } = props;
  const ctx = useContext(ProfileContext);
  const {variables} = ctx;
  const comparisons = typeof props.default === "string"
    ? props.default.split(",").filter(d => d.length)
    : props.default || [];
  const activeValue = props.default;
  const slug = `${name}-${id}`;
  const labels = options.reduce((acc, d) => ({...acc, [d.option]: d.label}), {});

  const onSelectorWrapper = (name, value) => {
    const {
      onSelector, variables, compVariables, comparison
    } = ctx;
    const isComparison = comparison && compVariables.id === variables.id;
    onSelector(name, value, isComparison);
  };

  // const addComparison = (comparison) => {
  //   const filteredComparison = comparisons.concat([comparison]);
  //   const {name} = this.props;
  //   this.onSelectorWrapper(name, filteredComparison);
  // };

  // const removeComparison = (option) => {
  //   const {comparisons} = this.state;
  //   const filteredComparison = comparisons.filter((d) => d !== option);
  //   const {name} = this.props;
  //   this.onSelectorWrapper(name, filteredComparison);
  // };

  if (type === "multi") {
    return null;
    // TODO:
    // return <div className={ `bp3-fill ${type === "multi" ? "" : "bp3-select"}` }>
    //   { title && <label htmlFor={slug}>{title}</label> }
    //   {comparisons && comparisons.length > 0 &&
    //     <div className="multi-list">
    //       { comparisons.map(d => <div key={d} className="multi-item bp3-tag bp3-tag-removable">
    //         { stripHTML(labels[d] || variables[d] || d) }
    //         <button aria-label={`${labels[d] || variables[d] || d} (remove)`} className="bp3-tag-remove" onClick={this.removeComparison.bind(this, d)} />
    //       </div>) }
    //     </div>
    //   }
    //   {!print && options && options.length && comparisons && comparisons.length >= 0 && comparisons.length !== options.length
    //     ? <BlueprintSelect name={slug}
    //       filterable={false}
    //       noResults={<MenuItem disabled text="No results." />}
    //       onItemSelect={this.addComparison.bind(this)}
    //       items={options.map(d => d.option)}
    //       itemRenderer={this.renderItem.bind(this)}>
    //       <button type="button" className="multi-add bp3-button bp3-icon-plus">
    //         {t("CMS.Selector.Add a Comparison")}
    //       </button>
    //     </BlueprintSelect>
    //     : null
    //   }
    // </div>;
  }
  // single selector
  if (options && options.length >= 2) {
    // // only show selected option in print mode
    // if (print) {
    //   const b = options.find(b => b.option === activeValue);
    //   if (!b) return null;
    //   return <ButtonGroup label={title} className="cp-selector-button-group" fontSize={fontSize}>
    //     <Button
    //       className="cp-selector-button"
    //       fill={false}
    //       fontSize={fontSize}
    //     >
    //       {stripHTML(b.label || variables[b.option])}
    //     </Button>
    //   </ButtonGroup>;
    // }

    // options under selectCutoff; button group
    if (options.length <= selectCutoff && options.every(b => stripHTML(b.label || variables[b.option]).length < 20)) {
      return (
        <Stack>
          <Text>{title}</Text>
          <SegmentedControl
            defaultValue={activeValue}
            onChange={value => onSelectorWrapper(name, value)}
            data={options.map(o => ({value: o.option, label: stripHTML(o.label || variables[o.option])}))}
            fullWidth
          />
        </Stack>
      );
    }
    // options over selectCutoff; select menu
    return (
      <Select
        label={title}
        fontSize={fontSize}
        id={slug}
        onChange={value => onSelectorWrapper(name, value)}
        disabled={loading}
        defaultValue={activeValue}
        data={options.map(o => ({value: o.option, label: stripHTML(o.label || variables[o.option])}))}
      />
    );
  }

  return false;
}
