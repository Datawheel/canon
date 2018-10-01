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

    context.loadControl(
      () => {
        const item = this.createNewInstance.call(this);
        return {
          query: {
            [targetLabel]: [].concat(items, item)
          }
        };
      },
      context.generateQueries,
      context.fetchQueries
    );
  }

  updateElement(item) {
    const {context, targetLabel} = this;
    const {items} = this.props;

    const index = items.findIndex(obj => obj.uuid === item.uuid);
    if (index === -1) return;

    context.loadControl(
      () => {
        const newItems = items.slice();
        newItems.splice(index, 1, item);
        return {
          query: {
            [targetLabel]: newItems
          }
        };
      },
      context.generateQueries,
      context.fetchQueries
    );
  }

  deleteElement(item) {
    const {context, targetLabel} = this;
    const {items} = this.props;

    const index = items.findIndex(obj => obj.uuid === item.uuid);
    if (index === -1) return;

    context.loadControl(
      () => {
        const newItems = items.slice();
        newItems.splice(index, 1);
        return {
          query: {
            [targetLabel]: newItems
          }
        };
      },
      context.generateQueries,
      context.fetchQueries
    );
  }
}

SidebarCRUDManager.contextTypes = {
  generateQueries: PropTypes.func,
  fetchQueries: PropTypes.func,
  loadControl: PropTypes.func,
  stateUpdate: PropTypes.func
};

SidebarCRUDManager.defaultProps = {
  items: []
};

export default SidebarCRUDManager;
