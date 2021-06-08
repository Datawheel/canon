import React, {Component} from "react";

import Button from "../../fields/Button";

import "./DialogFooter.css";

class DialogFooter extends Component {

  render() {
    const {children, onDelete, onSave, onTranslate} = this.props;

    return (
      <div className="cms-dialog-footer">
        {children}

        {onTranslate &&
          <Button
            className="cms-dialog-footer-button cms-dialog-footer-translate-button"
            onClick={onTranslate}
            namespace="cms"
            fontSize="xs"
            icon="translate"
            iconPosition="left"
            key="t"
          >
            Translate
          </Button>
        }

        {onDelete &&
          <Button
            className="cms-dialog-footer-button cms-dialog-footer-delete-button"
            onClick={onDelete}
            namespace="cms"
            fontSize="xs"
            icon="trash"
            iconPosition="left"
            key="d"
          >
            Delete
          </Button>
        }

        <Button
          className="cms-dialog-footer-button cms-dialog-footer-save-button"
          onClick={onSave}
          namespace="cms"
          fontSize="xs"
          icon="tick-circle"
          iconPosition="left"
          key="s"
        >
          Save &amp; close
        </Button>
      </div>
    );
  }
}

export default DialogFooter;
