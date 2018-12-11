import React, {Component} from "react";

class FooterButtons extends Component {

  render() {

    const {onDelete, onCancel, onSave} = this.props;

    return (
      <div id="buttons">
        <div className="pt-dialog-footer">
          <div className="pt-dialog-footer-actions">
            {this.props.onDelete &&
              <button className="cms-dialog-footer-button" onClick={onDelete}>
                <span className="cms-dialog-footer-button-icon pt-icon pt-icon-trash" /> Delete
              </button>
            }
            <button className="cms-dialog-footer-button" onClick={onSave}>
              <span className="cms-dialog-footer-button-icon pt-icon pt-icon-tick-circle" /> Save & close
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default FooterButtons;
