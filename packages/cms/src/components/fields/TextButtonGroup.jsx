import React, {Component} from "react";
// import {Icon} from "@blueprintjs/core";
import TextInput from "./TextInput";
import Button from "./Button";
import "./TextButtonGroup.css";

/** group a TextInput and a Button together */
export default class TextButtonGroup extends Component {
  render() {
    const {
      className,
      namespace,    // "cp" (default) or "cms"
      inputProps,
      buttonProps
    } = this.props;

    return (
      <form
        className={`${namespace}-text-button-group${className ? ` ${className}` : ""}`}
        onSubmit={e => e.preventDefault()}
      >
        <TextInput key={inputProps.label} {...inputProps} />
        <Button key={buttonProps.children} {...buttonProps} />
      </form>
    );
  }
}

TextButtonGroup.defaultProps = {
  namespace: "cp"
};
