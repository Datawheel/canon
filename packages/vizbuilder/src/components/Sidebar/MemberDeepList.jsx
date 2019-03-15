import React from "react";
import classnames from "classnames";

class DeepList extends React.PureComponent {
  constructor(props) {
    super(props);

    const initialDepth =
      props.items.length > 0 ? Math.max(0, props.items[0].depth - 1) : 0;
    this.state = {
      currDepth: initialDepth,
      currParent: "",
      initialDepth
    };

    this.backHandler = () => this.setState(state => ({currDepth: state.currDepth + 1}));
    this.selectMenuHandler = item => {
      this.setState(state => ({
        currDepth: state.currDepth - 1,
        currParent: state.currDepth === 1 ? item : state.currParent
      }));
    };
    this.selectItemHandler = item => {
      this.props.onSelect && this.props.onSelect(item);
    };
  }

  itemListComposer(items, currDepth, currParent) {
    if (currDepth > 0) {
      const parentMap = {};
      let n = items.length;
      while (n--) {
        const label = items[n].ancestors[currDepth - 1].name;
        parentMap[label] = true;
      }
      return Object.keys(parentMap).sort();
    }

    return currParent
      ? items.filter(item => item.ancestors[0].name === currParent)
      : items;
  }

  render() {
    const props = this.props;
    const {currDepth, currParent, initialDepth} = this.state;

    const items = this.itemListComposer(props.items, currDepth, currParent);
    const renderer = currDepth > 0 ? this.menuRenderer : this.itemRenderer;

    return (
      <div className={classnames("deeplist-wrapper", props.className)}>
        <div
          className={classnames("deeplist-header", {active: currDepth < initialDepth})}
        >
          <div className="deeplist-title">
            {currParent && <span className="topic">{currParent}</span>}
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
    const isActive = props.value.find(val => val.key === item.key);
    return (
      <li key={item.key}>
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

export default DeepList;
