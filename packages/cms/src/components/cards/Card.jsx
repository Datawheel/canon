import React, {Component} from "react";
import {Icon} from "@blueprintjs/core";

import stripEntities from "../../utils/formatters/stripEntities";
import Alert from "../interface/Alert";
import ReorderButton from "./components/ReorderButton";
import ButtonGroup from "../fields/ButtonGroup";
import "./Card.css";

/** Wrapper to generate markup for all admin cards */
export default class Card extends Component {
  render() {
    const {
      style,           // pretty much just for visualization card height
      title,           // card title
      type,            // generator, materializer, formatter
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

    // buttons
    const buttons = [];
    const buttonProps = {
      className: "cms-card-heading-button",
      fontSize: "xxxs",
      namespace: "cms",
      iconOnly: true
    };
    let deleteButton, refreshButton;

    // refresh button
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

    // delete button
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

    // alerts
    let showAlert = false;
    if (alertObj && onAlertCancel) showAlert = true;

    let alertProps = {};
    if (showAlert) {
      alertProps = {
        title: alertObj.title,
        cancelButtonText: "Cancel",
        confirmButtonText: alertObj.confirm,
        className: "cms-confirm-alert",
        description: alertObj.description,
        isOpen: showAlert,
        onConfirm: alertObj.callback,
        onCancel: onAlertCancel,
        portalProps: {namespace: "cms"},
        theme: alertObj.theme || "danger"
      };
    }

    return (
      <div className={`cms-card cms-${type}-card${ secondaryLocale ? " is-multilingual" : "" }`} style={style}>
        {/* cover button */}
        {onEdit &&
          <button className="cms-card-cover-button" onClick={onEdit} key="eb">
            <span className="u-visually-hidden">edit {title}</span>
          </button>
        }

        {/* header */}
        <div className="cms-card-heading" key="h">
          {/* card is editable */}
          {onEdit && <Icon className="cms-card-heading-icon" icon="cog" />}
          {/* card title */}
          <h3 className="cms-card-heading-text u-font-xs">
            {stripEntities(title) || "Add a title"}
          </h3>
          {/* buttons show to the right of the title */}
          {buttons.length
            ? <ButtonGroup namespace="cms" buttons={buttons} /> : ""
          }
        </div>

        {/* card content preview */}
        {children}
        {/* reorder button */}
        {reorderProps && <ReorderButton {...reorderProps} key="rb"/>}
        {/* are you suuuuuuuuuure */}
        <Alert {...alertProps} key="a" />
      </div>
    );
  }
}
