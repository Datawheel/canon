import classnames from "classnames";
import React from "react";
import {captionOrName} from "../../helpers/formatting";

class DeepList extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      currLevel: 2,
      currTopic: "",
      currSubtopic: ""
    };

    this.backHandler = () => this.setState(state => ({currLevel: state.currLevel + 1}));
    this.selectMenuHandler = item => {
      this.setState(state => ({
        currLevel: state.currLevel - 1,
        currTopic: state.currLevel === 2 ? item : state.currTopic,
        currSubtopic: state.currLevel === 1 ? item : state.currSubtopic
      }));
    };
    this.selectItemHandler = item => {
      this.props.onSelect && this.props.onSelect(item);
      this.setState({currLevel: 2, currTopic: "", currSubtopic: ""});
    };
  }

  render() {
    const props = this.props;
    const state = this.state;

    const level = state.currLevel;
    const items = props.itemListComposer.call(this, props.items);
    const renderer = level > 0 ? this.menuRenderer : this.itemRenderer;
    return (
      <div className={classnames("deeplist-wrapper", props.className)}>
        <div className={classnames("deeplist-header", {active: level < 2})}>
          <div className="deeplist-title">
            {level < 2 && <span className="topic">{state.currTopic}</span>}
            {level < 1 && <span className="subtopic">{state.currSubtopic}</span>}
          </div>
          <span className="deeplist-spacer" />
          <button
            type="button"
            className="pt-button pt-small pt-icon-circle-arrow-left"
            onClick={this.backHandler}
          >
            Back
          </button>
        </div>
        <ul className="pt-menu">{items.map(renderer, this)}</ul>
      </div>
    );
  }

  menuRenderer(item) {
    const {value} = this.props;
    const state = this.state;

    let isActive;
    if (state.currLevel == 2) {
      isActive = value && value.annotations._vb_topic === item;
    }
    else {
      isActive = value && value.annotations._vb_subtopic === item;
    }

    return (
      <li key={item} className="pt-submenu">
        <span className="pt-popover-target">
          <button
            tabIndex="0"
            type="button"
            className={classnames("pt-menu-item", {"pt-active": isActive})}
            onClick={this.selectMenuHandler.bind(this, item)}
          >
            {item}
          </button>
        </span>
      </li>
    );
  }

  itemRenderer(item) {
    const props = this.props;
    const isActive = item === props.value;
    return (
      <li key={item.annotations._key}>
        <button
          tabIndex="0"
          type="button"
          className={classnames("pt-menu-item select-item", {"pt-active": isActive})}
          onClick={this.selectItemHandler.bind(this, item)}
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

DeepList.defaultProps = {
  itemListComposer(items) {
    const {currLevel, currTopic, currSubtopic} = this.state;
    let n = items.length;

    if (currLevel == 2) {
      const topicMap = {};
      while (n--) {
        const label = items[n].annotations._vb_topic;
        topicMap[label] = true;
      }
      return Object.keys(topicMap).sort();
    }
    else if (currLevel == 1) {
      const subtopicMap = {};
      while (n--) {
        const measureAnn = items[n].annotations;
        if (measureAnn._vb_topic === currTopic) {
          const label = measureAnn._vb_subtopic;
          subtopicMap[label] = true;
        }
      }
      return Object.keys(subtopicMap).sort();
    }
    else {
      const itemList = [];
      while (n--) {
        const measure = items[n];
        if (
          measure.annotations._vb_topic === currTopic &&
          measure.annotations._vb_subtopic === currSubtopic
        ) {
          itemList.push(measure);
        }
      }
      return itemList.reverse();
    }
  },
  showDimensions: false
};

export default DeepList;
