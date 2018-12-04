import React from "react";
import PropTypes from "prop-types";

class SidebarCRUDItem extends React.Component {
  constructor(props) {
    super(props);

    this.handleApply = this.handleApply.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.item !== this.props.item) {
      this.handleClose();
    }
  }

  handleApply() {
    const item = this.state.newItem;
    return item && this.props.item !== item
      ? this.props.onUpdate(item)
      : this.handleClose();
  }

  handleClose() {
    this.setState({isOpen: false, newItem: null});
  }

  handleDelete() {
    this.props.onDelete(this.props.item);
  }

  handleEdit() {
    this.setState({isOpen: true});
  }

  handleUpdate(action, ...values) {
    const activeItem = this.state.newItem || this.props.item;
    const newItem = activeItem[action].apply(activeItem, values);
    this.setState({newItem});
  }
}

export default SidebarCRUDItem;
