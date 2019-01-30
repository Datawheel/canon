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
    const {preUpdateHook, postUpdateHook, targetLabel} = this;
    const {items} = this.props;

    const index = items.findIndex(obj => obj.uuid === item.uuid);
    if (index === -1) return;

    this.context.loadControl(() => {
      preUpdateHook && preUpdateHook.call(this, item);

      const newItems = items.slice();
      newItems.splice(index, 1, item);
      const output = {
        query: {
          [targetLabel]: newItems
        }
      };
      return postUpdateHook ? postUpdateHook(output) : output;
    });
  }

  deleteElement(item) {
    const {targetLabel} = this;
    const {items} = this.props;

    const index = items.findIndex(obj => obj.uuid === item.uuid);
    if (index === -1) return;

    const getNewPartialState = () => {
      const newItems = items.slice();
      newItems.splice(index, 1);
      return {
        query: {
          [targetLabel]: newItems
        }
      };
    };

    if (item.constructor.isValid(item)) {
      this.context.loadControl(getNewPartialState);
    }
    else {
      this.context.stateUpdate(getNewPartialState());
    }
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
