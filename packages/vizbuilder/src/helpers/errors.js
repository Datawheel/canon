import {Intent} from "@blueprintjs/core";

export class VizbuilderError extends Error {
  constructor(severity, message) {
    super(message);
    this.severity = severity;
  }
}

export class IncompleteParameter extends VizbuilderError {
  constructor(item, message) {
    super(Intent.DANGER, message);
    this.item = item;
  }
}

export class NoMoreOptions extends VizbuilderError {
  constructor(message) {
    super(Intent.WARNING, message);
  }
}

export class TooMuchData extends VizbuilderError {
  constructor(query, length) {
    super(
      Intent.DANGER,
      `This query returned too many data points.
Please try a query with less granularity.`
    );
    this.query = query;
    this.datasetLength = length;
  }
}

export class DimensionInUse extends VizbuilderError {
  constructor() {
    super(
      Intent.WARNING,
      `The selected property belongs to a dimension already in use by other group.
Select another dimension, or change the parameters for that group.`
    );
  }
}
