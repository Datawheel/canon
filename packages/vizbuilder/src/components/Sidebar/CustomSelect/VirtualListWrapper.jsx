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
  }

  getItemHeight(index) {
    const props = this.props;
    return props.getItemHeight(props.items[index]);
  }

  getStickyIndices(key, items) {
    const sticky = [];
    let n = items.length;
    while (n--) {
      if (items[n][key]) sticky.push(n);
    }
    sticky.reverse()
    return sticky;
  }

  renderItem({index, style}) {
    const props = this.props;
    const item = props.items[index];
    return props.itemRenderer({
      handleClick: () => props.onItemClick(item),
      index,
      isActive: props.findIndex(props.value, item) > -1,
      item,
      style
    });
  }

  render() {
    const props = this.props;

    const items = props.items;
    if (!items.length) return props.noResults;

    return (
      <VirtualList
        className={props.className}
        height={this.height}
        itemCount={items.length}
        itemSize={this.getItemHeight}
        renderItem={this.renderItem}
        scrollToAlignment="center"
        scrollToIndex={props.scrollToIndex}
        stickyIndices={props.sticky && this.getStickyIndices(props.sticky, items)}
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
  maxHeight: 300,
  noResults: null,
  onItemClick: undefined,
  scrollToIndex: undefined,
  sticky: null,
  value: undefined,
}

export default VirtualListWrapper;
