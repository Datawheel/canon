import React, {Component} from "react";
import Button from "./Button";
import "./ButtonGroup.css";

export default class ButtonGroup extends Component {
  render() {
    const {buttons, className, children, fontSize, namespace, label} = this.props;

    return (
      buttons || children
        ? <div className={`${namespace}-button-group u-font-${fontSize}${className ? ` ${className}` : ""}`}>
          {label && <span className={`${namespace}-label`}>
            {label}
          </span>}
          {children}
          {buttons && buttons.map(button =>
            <Button key={button.children} {...button} />
          )}
        </div> : ""
    );
  }
}

ButtonGroup.defaultProps = {
  namespace: "cp"
};
