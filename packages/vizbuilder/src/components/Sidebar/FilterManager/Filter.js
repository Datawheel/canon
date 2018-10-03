import {uuid} from "d3plus-common";

import OPERATORS, {LABELS, SYMBOLS} from "../../../helpers/operators";
import {isValidFilter, isNumeric} from "../../../helpers/validation";

class Filter {
  constructor(measure, operator, value) {
    this.uuid = uuid();
    this.measure = measure;
    this.operator = operator || OPERATORS.EQUAL;
    this.value = value || 0;
  }

  get name() {
    return this.measure && this.measure.name;
  }

  get operatorLabel() {
    return LABELS[this.operator];
  }

  get hasValue() {
    return isNumeric(this.value);
  }

  toString() {
    return (
      this.measure &&
      `${this.measure.annotations._key}-${this.operator}-${this.value}`
    );
  }

  serialize() {
    return (
      this.measure && [this.measure.name, SYMBOLS[this.operator], this.value]
    );
  }

  getClone() {
    const clone = new Filter(this.measure, this.operator);
    clone.uuid = this.uuid;
    return clone;
  }

  setMeasure(measure) {
    const clone = this.getClone();
    clone.measure = measure;
    return clone;
  }

  setOperator(evt) {
    const clone = this.getClone();
    clone.operator = evt.target.value * 1 || 0;
    return clone;
  }

  setValue(value) {
    const clone = this.getClone();
    clone.value = value || 0;
    return clone;
  }
}

Filter.isValid = isValidFilter;

export default Filter;
