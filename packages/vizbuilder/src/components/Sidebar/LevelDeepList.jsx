import React from "react";
import classnames from "classnames";

class DeepList extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      currView: 1,
      currDimension: ""
    };

    this.backHandler = () => this.setState(state => ({currView: state.currView + 1}));
    this.selectMenuHandler = item => {
      this.setState(state => ({
        currView: state.currView - 1,
        currDimension: state.currView === 1 ? item : state.currDimension
      }));
    };
    this.selectItemHandler = item => {
      this.props.onSelect && this.props.onSelect(item);
      this.setState({currView: 1, currDimension: ""});
    };
  }

  render() {
    const props = this.props;
    const state = this.state;

    const level = state.currView;
    const items = props.itemListComposer.call(this, props.items);
    const renderer = level > 0 ? this.menuRenderer : this.itemRenderer;
    return (
      <div className={classnames("deeplist-wrapper", props.className)}>
        <div className={classnames("deeplist-header", {active: level < 1})}>
          <div className="deeplist-title">
            {level < 1 && <span className="topic">{state.currDimension}</span>}
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

    const isActive = value && value.name === item;

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
          <span className="select-label">{item.name}</span>
        </button>
      </li>
    );
  }
}

DeepList.defaultProps = {
  itemListComposer(items) {
    const {currView, currDimension} = this.state;

    if (currView == 1) {
      const dimMap = {};
      let n = items.length;
      while (n--) {
        const label = items[n].hierarchy.dimension.name;
        dimMap[label] = true;
      }
      return Object.keys(dimMap).sort();
    }

    return items.filter(lvl => {
      return lvl.hierarchy.dimension.name === currDimension;
    });
  }
};

export default DeepList;
