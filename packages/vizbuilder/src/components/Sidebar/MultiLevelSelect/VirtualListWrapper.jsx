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
      return height > 300
    });
    this.height = height;
  }

  getItemHeight(index) {
    const props = this.props;
    return props.getItemHeight(props.items[index]);
  }

  renderItem({index, style}) {
    const props = this.props;
    const item = props.items[index];
    return props.itemRenderer({
      handleClick: () => props.onItemClick(item),
      index,
      isActive: props.value.indexOf(item) > -1,
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
        width={300}
        height={this.height}
        itemCount={items.length}
        itemSize={this.getItemHeight}
        renderItem={this.renderItem}
        scrollToIndex={props.scrollToIndex}
        scrollToAlignment="center"
      />
    );
  }
}

export default VirtualListWrapper;
