import React, {Component} from "react";
import ISO6391 from "iso-639-1";

export default class LocaleName extends Component {
  render() {
    const {locale, children} = this.props;
    return ISO6391.getName(locale || children);
  }
}
