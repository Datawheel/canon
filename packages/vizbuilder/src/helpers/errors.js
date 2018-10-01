import {Intent} from "@blueprintjs/core";

export class VizbuilderError extends Error {
  constructor(message, severity) {
    super(message);
    this.severity = severity;
  }
}

export class TooMuchData extends VizbuilderError {
  constructor(query, length) {
    super(
      `This query returned too many data points.
Please try a query with less granularity.`,
      Intent.DANGER
    );
    this.query = query;
    this.datasetLength = length;
  }
}
