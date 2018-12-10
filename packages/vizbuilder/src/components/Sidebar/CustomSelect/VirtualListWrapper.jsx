import React from "react";
import VirtualList from "react-tiny-virtual-list";

class VirtualListWrapper extends React.Component {
  constructor(props) {
    super(props);

    this.getItemHeight = this.getItemHeight.bind(this);
    this.renderItem = this.renderItem.bind(this);

    let height = 0;
    props.items.some(item => {
      height += props.getItemHeight(item);
      return height > props.maxHeight;
    });
    this.height = Math.max(100, height);
    this.calculatedSize = new WeakMap();

    this.vlist = undefined;
    this.vlistRef = node => {
      this.vlist = node;
      node && node.recomputeSizes();
    };
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
      if (items[n][key]) sticky.unshift(n);
    }
    return sticky;
  }

  updateLocalSize(index, node) {
    if (!node) return;
    const props = this.props;
    const item = props.items[index];
    const bounds = node.getBoundingClientRect();
    const size = Math.max(props.itemMinSize, bounds.height);
    this.calculatedSize.set(item, size);
    this.vlist && this.vlist.recomputeSizes(index);
  }

  renderItem({index, style}) {
    const props = this.props;
    const item = props.items[index];
    const calculatedSize = this.calculatedSize.get(item);

    const renderedItem = props.itemRenderer({
      handleClick: () => props.onItemClick(item),
      index,
      isActive: props.findIndex([].concat(props.value), item) > -1,
      item,
      style
    });

    if (!calculatedSize) {
      const newStyle = {...style};
      delete newStyle.height;
      return React.cloneElement(renderedItem, {
        style: newStyle,
        ref: this.updateLocalSize.bind(this, index)
      });
    }

    return renderedItem;
  }

  render() {
    const props = this.props;

    const items = props.items;
    if (!items.length) return props.noResults;

    return (
      <VirtualList
        ref={this.vlistRef}
        className={props.className}
        height={this.height}
        itemCount={items.length}
        itemSize={this.getItemHeight}
        renderItem={this.renderItem}
        scrollToAlignment="center"
        scrollToIndex={props.scrollToIndex}
        stickyIndices={
          props.sticky && this.getStickyIndices(props.sticky, items)
        }
        width="100%"
      />
    );
  }
}

VirtualListWrapper.defaultProps = {
  findIndex: (haystack, needle) => haystack.indexOf(needle),
  getItemHeight: () => 26,
  itemRenderer: undefined,
  items: [],
  itemMinSize: 10,
  maxHeight: 300,
  noResults: null,
  onItemClick: undefined,
  scrollToIndex: undefined,
  sticky: null,
  value: undefined
};

export default VirtualListWrapper;
