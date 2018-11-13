import React from "react";
import PropTypes from "prop-types";

class SidebarCRUDManager extends React.Component {
  constructor(props) {
    super(props);

    this.createElement = this.createElement.bind(this);
    this.updateElement = this.updateElement.bind(this);
    this.deleteElement = this.deleteElement.bind(this);

    this.targetLabel = null;
  }

  createElement() {
    const {context, targetLabel} = this;
    const {items} = this.props;

    const item = this.createNewInstance.call(this);
    context.stateUpdate({
      query: {
        [targetLabel]: [].concat(items, item)
      }
    });
  }

  updateElement(item) {
    const {preUpdateHook, targetLabel} = this;
    const {items} = this.props;

    const index = items.findIndex(obj => obj.uuid === item.uuid);
    if (index === -1) return;

    this.context.loadControl(() => {
      preUpdateHook && preUpdateHook.call(this, item);

      const newItems = items.slice();
      newItems.splice(index, 1, item);
      return {
        query: {
          [targetLabel]: newItems
        }
      };
    });
  }

  deleteElement(item) {
    const {targetLabel} = this;
    const {items} = this.props;

    const index = items.findIndex(obj => obj.uuid === item.uuid);
    if (index === -1) return;

    this.context.loadControl(() => {
      const newItems = items.slice();
      newItems.splice(index, 1);
      return {
        query: {
          [targetLabel]: newItems
        }
      };
    });
  }
}

SidebarCRUDManager.contextTypes = {
  loadControl: PropTypes.func,
  stateUpdate: PropTypes.func
};

SidebarCRUDManager.defaultProps = {
  items: []
};

export default SidebarCRUDManager;
