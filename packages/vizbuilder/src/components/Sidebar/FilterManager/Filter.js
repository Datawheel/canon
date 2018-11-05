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

  get key() {
    return this.measure && this.measure.annotations._key;
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
    return this.measure && `${this.key}-${this.operator}-${this.value}`;
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
    if (this.measure !== measure) {
      const clone = this.getClone();
      clone.measure = measure;
      return clone;
    }
    return this;
  }

  setOperator(evt) {
    const newOperator = parseInt(evt.target.value, 10) || 1;
    if (this.operator !== newOperator) {
      const clone = this.getClone();
      clone.operator = newOperator;
      return clone;
    }
    return this;
  }

  setValue(valueAsNumber, valueAsString) {
    const newValue = valueAsString || 0;
    if (this.value !== newValue) {
      const clone = this.getClone();
      clone.value = newValue;
      return clone;
    }
    return this;
  }
}

Filter.isValid = isValidFilter;

export default Filter;
