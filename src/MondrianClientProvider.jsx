import React, { Children } from "react";
import { Client as MondrianClient } from 'mondrian-rest-client';

export default class MondrianClientProvider extends React.Component {

  static childContextTypes = {
    mondrianClient: React.PropTypes.object.isRequired
  };

  getChildContext() {
    return {
      mondrianClient: this.mondrianClient
    };
  }

  constructor(props, context) {
    super(props, context);
    this.mondrianClient = new MondrianClient(props.endpoint);
  }

  render() {
    return Children.only(this.props.children);
  }
}
