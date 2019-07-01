import React, {Component} from "react";
import Button from "./Button";
import "./ButtonGroup.css";

export default class ButtonGroup extends Component {
  render() {
    const {buttons, className} = this.props;


    return buttons.length &&
      <div className={`cms-button-group ${className || ""}`}>
        {buttons.map(button =>
          <Button key={button.children} {...button} />
        )}
      </div>
    ;
  }
}
