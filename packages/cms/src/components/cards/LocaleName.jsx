import React, {Component} from "react";
import ISO6391 from "iso-639-1";

// TODO: make this a helper function instead of a component
export default class LocaleName extends Component {
  render() {
    const {locale, children} = this.props;
    return ISO6391.getName(locale || children);
  }
}
