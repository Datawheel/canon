import React from "react";
import classNames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";

import MultiLevelSelect from "./MultiLevelSelect";

class MeasureSelect extends MultiLevelSelect {
  renderTarget(item) {
    return (
      <div className="select-item select-option option-measure current" title={item.caption || item.name}>
        <div className="select-value">
          <span className="select-label name">{item.caption || item.name}</span>
          <span className="select-label lead">{item.annotations._cb_tagline}</span>
        </div>
        <span className="pt-icon-standard pt-icon-double-caret-vertical" />
      </div>
    );
  }
}

MeasureSelect.displayName = "MeasureSelect";
MeasureSelect.defaultProps = {
  ...MultiLevelSelect.defaultProps,
  sticky: "_sticky",
  getItemHeight() {
    return 40;
  },
  itemListPredicate(query, items) {
    query = query.trim();
    query = escapeRegExp(query);
    query = query.replace(/\s+/g, ".+");
    const queryTester = RegExp(query || ".", "i");
    return items.filter(item => queryTester.test(item.annotations._searchIndex));
  },
  itemListComposer(items) {
    const nope = {
      annotations: {_cb_topic: "", _cb_subtopic: ""}
    };

    const {value, itemMap} = this.props;

    return items.reduce((all, measure, i, array) => {
      const topic = measure.annotations._cb_topic;
      const subtopic = measure.annotations._cb_subtopic;

      const prevMeasure = array[i - 1] || nope;

      if (
        topic !== prevMeasure.annotations._cb_topic ||
        subtopic !== prevMeasure.annotations._cb_subtopic
      ) {
        const header = {topic, _key: topic, _header: true, _sticky: true};

        if (subtopic) {
          header.subtopic = subtopic;
          header._key += `-${subtopic}`;
        }

        all.push(header);
      }

      const key = `${measure.annotations._cb_table_id}.${measure.name}`;
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
  itemRenderer({handleClick, isActive, item, style}) {
    const props = {key: item._key || item.annotations._key, style};
    const className = ["select-item", "option-filtermeasure"];
    let child1;
    let child2 = null;

    if (item._header) {
      className.push("select-optgroup");
      child1 = <span className="select-label h1" title={item.topic}>{item.topic}</span>;
      if (item.subtopic) {
        child2 = <span className="select-label h2" title={item.subtopic}>{item.subtopic}</span>;
      }
    } else {
      className.push("select-option");
      props.onClick = handleClick;
      props.title = item.name;
      child1 = <span className="select-label">{item.name}</span>;
      child2 = <span className="select-label lead">{item.annotations._cb_tagline}</span>;
    }

    props.className = classNames(className, {active: isActive});
    return React.createElement("div", props, child1, child2);
  }
};

export default MeasureSelect;
