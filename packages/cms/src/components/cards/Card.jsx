import React, {Component} from "react";
import {Alert, Icon} from "@blueprintjs/core";
import stripEntities from "../../utils/formatters/stripEntities";
import ButtonGroup from "../fields/ButtonGroup";
import ReorderButton from "./components/ReorderButton";
import "./Card.css";

/** Wrapper to generate markup for all admin cards */
export default class Card extends Component {
  render() {
    const {
      cardClass,       // purely for styling purposes (so far)
      style,           // pretty much just for visualization card height
      title,           // card title
      onEdit,          // edit button onClick
      onDelete,        // delete button onClick
      onRefresh,       // rebuilding and/or refreshing
      rebuilding,      // disable all buttons when true
      children,        // main card content
      secondaryLocale, // two columns

      reorderProps,    // show reorder button or not

      alertObj,        // object with {callback, confirm, message} used to configure alert
      onAlertCancel    // wipe alert state
    } = this.props;

    const buttonProps = {
      className: "cms-card-heading-button",
      fontSize: "xxxs",
      namespace: "cms",
      iconOnly: true
    };

    const buttons = [];
    let deleteButton, editButton, refreshButton;

    if (onRefresh) {
      refreshButton = Object.assign({}, {
        children: "refresh",
        icon: "refresh",
        fontSize: "xxs",
        onClick: onRefresh,
        disabled: rebuilding,
        rebuilding,
        ...buttonProps
      });
      buttons.push(refreshButton);
    }

    if (onDelete) {
      deleteButton = Object.assign({}, {
        children: "delete entry",
        icon: "trash",
        fontSize: "xxs",
        onClick: onDelete,
        disabled: rebuilding,
        ...buttonProps
      });
      buttons.push(deleteButton);
    }

    if (onEdit) {
      editButton = Object.assign({}, {
        children: "edit entry",
        icon: "cog",
        fontSize: "xxs",
        onClick: onEdit,
        disabled: rebuilding,
        ...buttonProps
      });
    }

    return (
      <div className={`cms-card cms-${ cardClass }-card${ secondaryLocale ? " is-multilingual" : "" }`} style={style}>

        {/* cover button */}
        {onEdit &&
          <button className="cms-card-cover-button" onClick={ onEdit }>
            <span className="u-visually-hidden">edit {title}</span>
          </button>
        }

        {/* header */}
        <div className="cms-card-heading">
          {onEdit &&
            <Icon className="cms-card-heading-icon" icon="cog" />
          }
          <h3 className="cms-card-heading-text u-font-xs">{stripEntities(title) || "Add a title"}</h3>
          {buttons.length
            ? <ButtonGroup namespace="cms" buttons={buttons} />
            : ""
          }
        </div>

        {/* content preview */}
        {children}

        {/* reorder buttons */}
        {reorderProps &&
          <ReorderButton
            id={reorderProps.id}
            type={reorderProps.type}
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
