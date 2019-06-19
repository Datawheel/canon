import React, {Component} from "react";
import {Alert} from "@blueprintjs/core";
import Button from "../Button";
import ReorderButtons from "../ReorderButtons";
import "./Card.css";

// TODO: rename existing Card.jsx (profile section layout?)
export default class CardWrapper extends Component {
  render() {
    const {
      cardClass,       // purely for styling purposes (so far)
      style,           // pretty much just for visualization card height
      title,           // card title
      onEdit,          // edit button onClick
      children,        // main card content
      secondaryLocale, // we're gonna need a bigger card

      reorderProps,    // object with {item, array, type} used to configure ReorderButtons
      onReorder,       // callback for when you reorder

      alertObj,        // object with {callback, confirm, message} used to configure alert
      onAlertCancel    // wipe alert state
    } = this.props;

    return (
      <div className={`cms-card cms-${ cardClass }-card${ secondaryLocale ? " is-wide" : "" }`} style={style}>
        {/* header */}
        <div className="cms-card-heading">
          <h3 className="cms-card-heading-text font-sm">{title || "missing `title` prop in CardWrapper.jsx"}</h3>

          {/* switch to edit mode */}
          {onEdit &&
            <Button className="cms-card-heading-button font-xs" onClick={onEdit} icon="cog">
              Edit
            </Button>
          }
        </div>

        {/* content preview */}
        {children}

        {/* reorder buttons */}
        {reorderProps && onReorder &&
          <ReorderButtons
            item={reorderProps.item}
            array={reorderProps.array}
            type={reorderProps.type}
            onMove={onReorder}
          />
        }

        {/* are you suuuuuuuuuure */}
        {alertObj && onAlertCancel &&
          <Alert
            cancelButtonText="Cancel"
            confirmButtonText={alertObj.confirm}
            className="cms-confirm-alert"
            iconName="warning-sign"
            isOpen={alertObj}
            onConfirm={alertObj.callback}
            onCancel={onAlertCancel}
          >
            {alertObj.message}
          </Alert>
        }
      </div>
    );
  }
}
