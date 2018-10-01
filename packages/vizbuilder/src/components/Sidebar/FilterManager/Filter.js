import {uuid} from "d3plus-common";
import OPERATORS, {SYMBOLS} from "../../../helpers/operators";

class Filter {
  static isValid(filter) {
    return filter && filter.measure && filter.hasValue;
  }

  constructor(measure, operator) {
    this.uuid = uuid();
    this.measure = measure;
    this.operator = operator || OPERATORS.EQUAL;
    this.value = 0;
  }

  get name() {
    return this.measure && this.measure.name;
  }

  get hasValue() {
    return isFinite(this.value) && !isNaN(this.value);
  }

  toString() {
    return (
      this.measure &&
      `${this.measure.annotations._key}-${this.operator}-${this.value}`
    );
  }

  serialize() {
    return [this.measure.name, SYMBOLS[this.operator], this.value];
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

  setOperator(operator) {
    const clone = this.getClone();
    clone.operator = operator;
    return clone;
  }

  setValue(value) {
    const clone = this.getClone();
    clone.value = value;
    return clone;
  }
}

export default Filter;
