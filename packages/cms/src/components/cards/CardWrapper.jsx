import React, {Component} from "react";
import {Alert, Icon} from "@blueprintjs/core";
import Button from "../Button";
import ButtonGroup from "../ButtonGroup";
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
      secondaryLocale, // two columns

      reorderProps,    // object with {item, array, type} used to configure ReorderButtons
      onReorder,       // callback for when you reorder

      alertObj,        // object with {callback, confirm, message} used to configure alert
      onAlertCancel    // wipe alert state
    } = this.props;

    const buttonProps = {
      className: "cms-card-heading-button font-xxs",
      iconOnly: true
    };

    const buttons = [];
    let deleteButton, editButton;

    // TODO: add onDelete logic
    const onDelete = onEdit;
    if (onDelete) {
      deleteButton = Object.assign({}, {
        children: "delete entry",
        icon: "trash",
        ...buttonProps
      });
      buttons.push(deleteButton);
    }

    if (onEdit) {
      editButton = Object.assign({}, {
        children: "edit entry",
        icon: "cog",
        onClick: onEdit,
        ...buttonProps
      });
    }

    return (
      <div className={`cms-card cms-${ cardClass }-card${ secondaryLocale ? " is-multilingual" : "" }`} style={style}>

        {/* cover button */}
        {onEdit && title &&
          <button className="cms-card-cover-button" onClick={ onEdit }>
            <span className="u-visually-hidden">edit {title}</span>
          </button>
        }

        {/* header */}
        <div className="cms-card-heading">
          {onEdit &&
            <Icon className="cms-card-heading-icon" icon="cog" />
          }
          <h3 className="cms-card-heading-text font-sm">{title || "missing `title` prop in CardWrapper.jsx"}</h3>
          {buttons.length
            ? <ButtonGroup buttons={buttons} />
            : ""
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
