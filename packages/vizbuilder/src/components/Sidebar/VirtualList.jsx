import React from "react";
import classnames from "classnames";
import TinyVirtualList from "react-tiny-virtual-list";

class VirtualList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      forcedUpdate: undefined
    };

    this.calculatedSize = new WeakMap();
    this.height = 400;

    this.vlist = undefined;
    this.vlistRef = node => {
      this.vlist = node;
      node && node.recomputeSizes();
    };

    this.forceRendering = this.forceRendering.bind(this);
    this.getItemHeight = this.getItemHeight.bind(this);
    this.renderItem = this.renderItem.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.items.length !== nextProps.items.length) {
      this.calculatedSize = new WeakMap();
      return true;
    }
    if (this.state.forcedUpdate !== nextState.forcedUpdate) {
      return true;
    }
    return false;
  }

  selectItemHandler(item) {
    this.props.onSelect && this.props.onSelect(item);
  }

  forceRendering() {
    this.getItemHeight = this.getItemHeight.bind(this);
    this.setState({forcedUpdate: !this.state.forcedUpdate});
  }

  updateLocalSize(index, node) {
    if (!node) return;

    const props = this.props;
    const item = props.items[index];
    const bounds = node.getBoundingClientRect();
    const size = Math.max(props.itemMinSize, bounds.height);
    this.calculatedSize.set(item, size);

    cancelAnimationFrame(this.forcedRenderingCall);
    this.forcedRenderingCall = requestAnimationFrame(this.forceRendering);
  }

  getItemHeight(index) {
    const props = this.props;
    const item = props.items[index];
    return this.calculatedSize.get(item) || props.getItemHeight(item);
  }

  getStickyIndices(key, items) {
    const sticky = [];
    let n = items.length;
    while (n--) {
      if (key in items[n]) sticky.unshift(n);
    }
    return sticky;
  }

  renderItem({index, style}) {
    const props = this.props;
    const item = props.items[index];
    const calculatedSize = this.calculatedSize.get(item);

    const element = props.itemRenderer(item, {
      handleClick: this.selectItemHandler.bind(this, item),
      style,
      index,
      isActive: props.findIndex([].concat(props.value), item) > -1
    });

    if (!calculatedSize) {
      const newStyle = {...style};
      delete newStyle.height;
      return React.cloneElement(element, {
        style: newStyle,
        ref: this.updateLocalSize.bind(this, index)
      });
    }

    return element;
  }

  render() {
    const props = this.props;

    const items = props.items;
    if (!items.length) return props.noResults;

    const lastValue = [].concat(props.value).pop();
    const valueIndex = props.findIndex(items, lastValue);

    return (
      <TinyVirtualList
        ref={this.vlistRef}
        className={classnames("virtlist-wrapper", props.className)}
        height={this.props.height || this.height}
        itemCount={items.length}
        itemSize={this.getItemHeight}
        renderItem={this.renderItem}
        scrollToAlignment="center"
        scrollToIndex={valueIndex}
        stickyIndices={props.sticky && this.getStickyIndices(props.sticky, items)}
        width="100%"
      />
    );
  }
}

VirtualList.defaultProps = {
  sticky: "isHeader",
  findIndex: (haystack, needle) => haystack.indexOf(needle),
  getItemHeight: item => (item.isHeader ? 38.4 : 50),
  itemRenderer: undefined,
  items: [],
  itemMinSize: 38,
  maxHeight: 300,
  noResults: null,
  scrollToIndex: undefined,
  value: undefined
};

export default VirtualList;
