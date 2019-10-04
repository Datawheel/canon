import classNames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";
import React from "react";
import {captionOrName} from "../../helpers/formatting";
import {BaseMonoSelect} from "./CustomSelect";

class MeasureSelect extends BaseMonoSelect {
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
}

const headerItems = {};

MeasureSelect.displayName = "MeasureSelect";
MeasureSelect.defaultProps = {
  ...BaseMonoSelect.defaultProps,
  sticky: "_sticky",
  getItemHeight() {
    return 58;
  },
  itemListPredicate(query, items) {
    query = query.trim();
    query = escapeRegExp(query).replace(/\s+/g, "[^_]+");
    const queryTester = RegExp(query || ".", "i");
    return items.filter(item => queryTester.test(item.annotations._searchIndex));
  },
  itemListComposer(items) {
    const nope = {
      annotations: {_vb_topic: "", _vb_subtopic: ""}
    };

    const {value, itemMap} = this.props;

    return items.reduce((all, measure, i, array) => {
      const topic = measure.annotations._vb_topic;
      const subtopic = measure.annotations._vb_subtopic || undefined;

      const prevMeasure = array[i - 1] || nope;

      if (
        topic !== prevMeasure.annotations._vb_topic ||
        subtopic !== prevMeasure.annotations._vb_subtopic
      ) {
        let _key = topic + (subtopic ? `-${subtopic}` : "");
        const header = headerItems[_key] || {
          topic,
          subtopic,
          _key,
          _header: true,
          _sticky: true
        };
        headerItems[_key] = header;
        all.push(header);
      }

      const key = `${measure.annotations._vb_cbTableId}.${measure.name}`;
      if (key in itemMap) {
        const valueInTableId = itemMap[key].indexOf(value) > -1;
        const reprMeasure = valueInTableId ? value : itemMap[key][0];
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
  itemMinHeight: 44,
  itemRenderer({handleClick, isActive, item, style}) {
    const props = {key: item._key || item.annotations._key, style};
    const className = ["select-item", "option-filtermeasure"];
    const params = ["div", props];

    if (item._header) {
      className.push("select-optgroup");
      params.push(
        <span className="select-label h1" title={item.topic}>
          {item.topic}
        </span>
      );
      if (item.subtopic) {
        params.push(
          <span className="select-label h2" title={item.subtopic}>
            {item.subtopic}
          </span>
        );
      }
    }
    else {
      className.push("select-option");
      props.onClick = handleClick;
      const name = captionOrName(item);
      props.title = name;
      params.push(
        <span className="select-label">{name}</span>,
        <span className="select-label source">{item.annotations._vb_tagline}</span>,
        <span className="select-label dims">
          {item.annotations._dim_labels.map(label => (
            <span className="pt-tag">{label}</span>
          ))}
        </span>
      );
    }

    props.className = classNames(className, {active: isActive});
    return React.createElement(...params);
  }
};

export default MeasureSelect;
