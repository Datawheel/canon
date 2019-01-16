import React from "react";

function loadComponent(componentLoader) {
  return class extends React.PureComponent {
    static preneed = [componentLoader];
    static need = [componentLoader];
    static postneed = [componentLoader];

    state = {
      Component: null
    };

    componentDidMount() {
      componentLoader().then(module => {
        this.setState({Component: module.default});
      });
    }

    render() {
      const {Component} = this.state;
      return Component
        ? React.createElement(Component, this.props)
        : React.createElement("div", {}, "Loading...");
    }
  }
}

export default loadComponent;
