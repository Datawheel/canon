import * as d3Array from "d3-array";
import * as d3Collection from "d3-collection";
import * as d3Format from "d3-format";
import * as d3TimeFormat from "d3-time-format";
import {formatAbbreviate} from "d3plus-format";
import {date} from "d3plus-axis";
import {assign, closest, merge} from "d3plus-common";
import {strip, titleCase} from "d3plus-text";
import stats from "./stats";

export default {
  d3: {
    ...d3Array, ...d3Collection, ...d3Format, ...d3TimeFormat,
  },
  d3plus: {
    assign, closest, date, formatAbbreviate, merge, strip, titleCase,
  },
  stats,
};