import React from "react";
import escapeRegExp from "lodash/escapeRegExp";

import BaseSelect from "./CustomSelect/BaseSelect";
import DeepList from "./DeepList";

class NewMeasureSelect extends BaseSelect {
  renderTarget(item) {
    return (
      <div
        className="select-item select-option option-measure current"
        title={item.caption || item.name}
      >
        <div className="select-value">
          <span className="select-label name">{item.caption || item.name}</span>
          <span className="select-label source">{item.annotations._cb_tagline}</span>
        </div>
        <span className="pt-icon-standard pt-icon-double-caret-vertical" />
      </div>
    );
  }

  renderPopover(items) {
    const props = this.props;

    return (
      <div className="select-popover-content">
        {props.filterable && this.renderFilterInput()}
        <DeepList
          items={items}
          value={props.value}
          showDimensions={props.showDimensions}
          onSelect={this.handleItemSelect}
        />
      </div>
    );
  }
}

NewMeasureSelect.displayName = "MeasureSelect";

NewMeasureSelect.defaultProps = {
  ...BaseSelect.defaultProps,
  inputProps: {autoFocus: true},
  itemMinHeight: 10,

  itemListComposer(items) {
    /**
     * itemMap: { [x: string]: Measure[] }
     * x: measure.annotations._cb_table_id + "." + measure.name
     */
    const {value, itemMap} = this.props;

    return items.reduce((all, measure) => {
      const key = `${measure.annotations._cb_table_id}.${measure.name}`;
      const tableMap = itemMap[key];
      if (tableMap && tableMap.length > 0) {
        const valueInTableId = tableMap.indexOf(value) > -1;
        const reprMeasure = valueInTableId ? value : tableMap[0];
        if (all.indexOf(reprMeasure) === -1) {
          all.push(reprMeasure);
        }
      }
      else {
        all.push(measure);
      }
      return all;
    }, []);
  },

  itemListPredicate(query, items) {
    query = query.trim();
    query = escapeRegExp(query).replace(/\s+/g, "[^_]+");
    const queryTester = RegExp(query || ".", "i");
    return items.filter(item => queryTester.test(item.annotations._searchIndex));
  }
};

export default NewMeasureSelect;
