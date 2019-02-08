import React, {Component} from "react";

class FooterButtons extends Component {

  render() {

    const {onDelete, onSave} = this.props;

    return (
      <div id="buttons">
        <div className="bp3-dialog-footer">
          <div className="bp3-dialog-footer-actions">
            {this.props.onDelete &&
              <button className="cms-dialog-footer-button" onClick={onDelete}>
                <span className="cms-dialog-footer-button-icon bp3-icon bp3-icon-trash" /> Delete
              </button>
            }
            <button className="cms-dialog-footer-button" onClick={onSave}>
              <span className="cms-dialog-footer-button-icon bp3-icon bp3-icon-tick-circle" /> Save & close
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default FooterButtons;
