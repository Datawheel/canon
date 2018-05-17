import React from "react";
import store from ".";

/**
 * @param {React.ComponentClass} Component Component to wrap
 * @param {(state) => any} [stateMapper] Function to pick certain store items
 */
export default function connect(Component, stateMapper) {
  if (!stateMapper) stateMapper = state => state;

  return class Connector extends React.PureComponent {
    state = stateMapper(store.getState());
    removeListener = store.addListener(state => {
      this.setState(stateMapper(state));
    });

    componentWillUnmount() {
      this.removeListener();
    }

    render() {
      return React.createElement(Component, { ...this.state, ...this.props });
    }
  };
}
