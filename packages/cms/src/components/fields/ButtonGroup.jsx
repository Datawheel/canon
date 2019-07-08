import React, {Component} from "react";
import Button from "./Button";
import "./ButtonGroup.css";

export default class ButtonGroup extends Component {
  render() {
    const {buttons, className, context} = this.props;


    return buttons.length &&
      <div className={`${context}-button-group ${className || ""}`}>
        {buttons.map(button =>
          <Button key={button.children} {...button} />
        )}
      </div>
    ;
  }
}

ButtonGroup.defaultProps = {
  context: "cp"
};
