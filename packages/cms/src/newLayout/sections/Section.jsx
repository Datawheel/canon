import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";

import {Alert, Button, Intent} from "@blueprintjs/core";

import {deleteEntity} from "../../actions/profiles";

import "./Section.css";

/**
 *
 */
function Section({section, isDragging, dragHandleProps}) {

  const dispatch = useDispatch();

  /* redux */
  const {localeDefault} = useSelector(state => ({
    localeDefault: state.cms.status.localeDefault
  }));

  /* mount */
  useEffect(() => {
    // todo1.0 load background images
    // todo1.0 reimplement titlesearch click
  }, []);

  /* state */
  const [showAlert, setShowAlert] = useState(false);

  const maybeDelete = () => {
    setShowAlert(true);
  };

  const onDelete = () => {
    setShowAlert(false);
    dispatch(deleteEntity("section", {id: section.id}));
  };

  const alertProps = {
    canOutsideClickCancel: true,
    icon: "trash",
    isOpen: showAlert,
    intent: Intent.DANGER,
    confirmButtonText: "Yes, Delete Section",
    onConfirm: onDelete,
    cancelButtonText: "Cancel",
    onCancel: () => setShowAlert(false)
  };

  // const {title} = section.contentByLocale[localeDefault].content;

  return (
    <div className={`cms-section${isDragging ? " isDragging" : ""}`}>
      <h1 key="h1">section {section.id}</h1>
      <h2 key="h2">ordering {section.ordering}</h2>
      <Button key="db1" className="cms-section-drag-button" icon="drag-handle-horizontal" {...dragHandleProps}/>
      <Button key="db2" onClick={maybeDelete} icon="trash" />
      <Alert {...alertProps} key="alert">
        Are you sure you want to delete this section and all its blocks? This action cannot be undone.
      </Alert>
    </div>
  );

}

export default Section;
