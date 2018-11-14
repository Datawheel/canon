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
    this.calculatedSize = [];

    this.vlist = undefined;
    this.vlistRef = node => {
      this.vlist = node;
      node && node.recomputeSizes();
    };
  }

  getItemHeight(index) {
    const size = this.calculatedSize[index];
    if (!size) {
      const props = this.props;
      return props.getItemHeight(props.items[index]);
    }
    return size;
  }

  getStickyIndices(key, items) {
    const sticky = [];
    let n = items.length;
    while (n--) {
      if (items[n][key]) sticky.push(n);
    }
    sticky.reverse();
    return sticky;
  }

  updateLocalSize(index, node) {
    if (!node) return;
    const bounds = node.getBoundingClientRect();
    this.calculatedSize[index] = Math.max(
      this.props.itemMinSize,
      bounds.height
    );
    this.vlist && this.vlist.recomputeSizes(index);
  }

  renderItem({index, style}) {
    const props = this.props;
    const item = props.items[index];
    const calculatedSize = this.calculatedSize[index];

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
  getItemHeight: () => 22,
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
