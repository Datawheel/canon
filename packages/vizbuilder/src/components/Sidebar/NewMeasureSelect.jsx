import classnames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";
import React from "react";
import {captionOrName} from "../../helpers/formatting";
import BaseSelect from "./CustomSelect/BaseSelect";
import DeepList from "./DeepList";
import VirtualList from "./VirtualList";

class NewMeasureSelect extends BaseSelect {
  constructor(props) {
    super(props);

    this.headerItems = [];
    this.makeItemHeader = this.makeItemHeader.bind(this);
  }

  makeItemHeader(prevMeasure, measure) {
    const topic = measure.annotations._vb_topic;
    const subtopic = measure.annotations._vb_subtopic;

    if (
      topic !== prevMeasure.annotations._vb_topic ||
      subtopic !== prevMeasure.annotations._vb_subtopic
    ) {
      let _key = topic + (subtopic ? `-${subtopic}` : "");
      const header = this.headerItems[_key] || {topic, subtopic, _key, isHeader: true};
      this.headerItems[_key] = header;
      return header;
    }
  }

  itemListComposer(items) {
    const nope = {annotations: {_vb_topic: "", _vb_subtopic: ""}};
    /**
     * itemMap: { [x: string]: Measure[] }
     * x: measure.annotations._vb_cbTableId + "." + measure.name
     */
    const {value, itemMap} = this.props;
    const hasQuery = Boolean(this.state.query);

    return items.reduce((all, measure, index, array) => {
      const key = `${measure.annotations._vb_cbTableId}.${measure.name}`;

      if (hasQuery) {
        const header = this.makeItemHeader(array[index - 1] || nope, measure);
        header && all.push(header);
      }

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
  }

  renderTarget(item) {
    const name = captionOrName(item);
    return (
      <div className="select-item select-option option-measure current" title={name}>
        <div className="select-value">
          <span className="select-label name">{name}</span>
          <span className="select-label source">{item.annotations._vb_tagline}</span>
        </div>
        <span className="pt-icon-standard pt-icon-double-caret-vertical" />
      </div>
    );
  }

  renderPopover(items) {
    const props = this.props;
    const ListComponent = this.state.query ? VirtualList : DeepList;

    return (
      <div className="select-popover-content">
        {props.filterable && this.renderFilterInput()}
        <ListComponent
          items={items}
          value={props.value}
          showDimensions={props.showDimensions}
          itemRenderer={this.renderListItem.bind(this)}
          onSelect={this.handleItemSelect}
        />
      </div>
    );
  }

  renderListItem(item, params) {
    const props = this.props;

    if (item.isHeader) {
      return (
        <li className="virtlist-title" key={item._key} style={params.style}>
          <span className="topic" title={item.topic}>
            {item.topic}
          </span>
          <span className="subtopic" title={item.subtopic}>
            {item.subtopic}
          </span>
        </li>
      );
    }

    return (
      <li key={item.annotations._key} style={params.style}>
        <button
          tabIndex="0"
          type="button"
          className={classnames("pt-menu-item select-item", {
            "pt-active": params.isActive
          })}
          onClick={params.handleClick}
        >
          <span className="select-label">{captionOrName(item)}</span>
          {props.showDimensions && (
            <span className="select-label dims">
              {item.annotations._dim_labels.map(label => (
                <span className="pt-tag">{label}</span>
              ))}
            </span>
          )}
        </button>
      </li>
    );
  }
}

NewMeasureSelect.displayName = "MeasureSelect";

NewMeasureSelect.defaultProps = {
  ...BaseSelect.defaultProps,
  inputProps: {autoFocus: true},
  itemMinHeight: 10,

  itemListPredicate(query, items) {
    query = query.trim();
    query = escapeRegExp(query).replace(/\s+/g, "[^_]+");
    const queryTester = RegExp(query || ".", "i");
    return items.filter(item => queryTester.test(item.annotations._searchIndex));
  }
};

export default NewMeasureSelect;
