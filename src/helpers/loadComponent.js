import React from "react";

function MiniLoading(props) {
  return React.createElement("div", {className: "mini-loading"}, "Loading...");
}

function loadComponent(componentLoader) {
  let Component;
  if (typeof window === "undefined") {
    componentLoader().then(c => {
      Component = c.default;
    });
  }
  return class extends React.PureComponent {
    static preneed = Component ? Component.preneed : [componentLoader];
    static need = Component ? Component.need : [componentLoader];
    static postneed = Component ? Component.postneed : [componentLoader];

    state = {
      Component: Component || null
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
        : React.createElement(MiniLoading, this.props);
    }
  };
}

export default loadComponent;
