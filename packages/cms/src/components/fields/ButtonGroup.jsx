import React, {Component} from "react";
import Button from "./Button";
import "./ButtonGroup.css";

export default class ButtonGroup extends Component {
  render() {
    const {buttons, className, children, namespace} = this.props;

    return (
      buttons || children
        ? <div className={`${namespace}-button-group${className ? ` ${className}` : ""}`}>
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
