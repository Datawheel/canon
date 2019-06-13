import React from "react";
import classnames from "classnames";

class DeepList extends React.PureComponent {
  constructor(props) {
    super(props);

    const initialDepth =
      props.items.length > 0 ? Math.max(0, props.items[0].depth - 1) : 0;
    this.state = {
      currDepth: initialDepth,
      parentChain: [],
      initialDepth
    };

    this.backHandler = () =>
      this.setState(state => {
        const parentChain = state.parentChain.slice();
        parentChain.shift();
        return {currDepth: state.currDepth + 1, parentChain};
      });
    this.selectMenuHandler = item =>
      this.setState(state => {
        const parentChain = state.parentChain.slice();
        parentChain.unshift(item);
        return {currDepth: state.currDepth - 1, parentChain};
      });
    this.selectItemHandler = item => {
      this.props.onSelect && this.props.onSelect(item);
    };
  }

  itemListComposer(items) {
    const {currDepth, parentChain} = this.state;

    const currentParent = parentChain[0];
    if (currentParent) {
      items = items.filter(item => item.ancestors[currDepth].name === currentParent);
    }

    if (currDepth > 0) {
      const parentMap = {};
      let n = items.length;
      while (n--) {
        const label = items[n].ancestors[currDepth - 1].name;
        parentMap[label] = true;
      }
      return Object.keys(parentMap).sort();
    }

    return items;
  }

  render() {
    const props = this.props;
    const {currDepth, parentChain, initialDepth} = this.state;

    const items = this.itemListComposer.call(this, props.items);
    const renderer = currDepth > 0 ? this.menuRenderer : this.itemRenderer;
    const parents = parentChain.slice(0, 2).filter(Boolean).reverse();

    return (
      <div className={classnames("deeplist-wrapper", props.className)}>
        <div
          className={classnames("deeplist-header", {active: currDepth < initialDepth})}
        >
          <div className="deeplist-title">
            {parents.map(parent => <span className="topic">{parent}</span>)}
          </div>
          <span className="deeplist-spacer" />
          <button
            type="button"
            className="bp3-button bp3-small bp3-icon-circle-arrow-left"
            onClick={this.backHandler}
          >
            Back
          </button>
        </div>
        <ul className="bp3-menu">{items.map(renderer, this)}</ul>
      </div>
    );
  }

  menuRenderer(item) {
    const {value} = this.props;
    const isActive = value && value.name === item;

    return (
      <li key={item} className="bp3-submenu">
        <span className="bp3-popover-target">
          <button
            className={classnames("bp3-menu-item", {"bp3-active": isActive})}
            onClick={this.selectMenuHandler.bind(this, item)}
            tabIndex="0"
            title={item}
            type="button"
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
          className={classnames("bp3-menu-item select-item", {"bp3-active": isActive})}
          onClick={this.selectItemHandler.bind(this, item)}
          tabIndex="0"
          title={item.name}
          type="button"
        >
          <span className="select-label">{item.name}</span>
        </button>
      </li>
    );
  }
}

export default DeepList;
