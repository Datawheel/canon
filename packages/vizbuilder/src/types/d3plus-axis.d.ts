import {TimeLocaleDefinition} from "d3-time-format";
import {ShapeCircleConfig, ShapeLineConfig, ShapeRectConfig} from "d3plus-shape";

declare module "d3plus-axis" {
  type SVGAttributeHyphen = string;

  export interface AxisConfig {
    /**
   * Sets the horizontal alignment to the specified value.
   */
    align: "start" | "middle" | "end";

    /**
   * Sets the axis line style.
   * Keys are SVG attributes, in kebab-case.
   */
    barConfig: Record<SVGAttributeHyphen, string>;

    /**
   * Sets the scale domain of the axis.
   */
    domain: [number, number];

    /**
   * Sets the transition duration of the axis.
   */
    duration: number;

    /**
   * Sets the grid values of the axis.
   */
    grid: number[];

    /**
   * Sets the grid config of the axis.
   * Keys are SVG attributes, in kebab-case.
   */
    gridConfig: Record<SVGAttributeHyphen, string>;

    /**
   * Sets the grid behavior of the axis when scale is logarithmic.
   */
    gridLog: boolean;

    /**
   * Sets the grid size of the axis.
   */
    gridSize: number;

    /**
   * Sets the overall height of the axis.
   */
    height: number;

    /**
   * Sets the visible tick labels of the axis.
   */
    labels: number[] | string[];

    /**
   * Sets whether offsets will be used to position some labels further away from the axis in order to allow space for the text.
   */
    labelOffset: boolean;

    /**
   * Sets whether whether horizontal axis labels are rotated -90 degrees.
   */
    labelRotation: boolean;

    /**
   * Sets the maximum size allowed for the space that contains the axis tick labels and title.
   */
    maxSize: number;

    /**
   * Sets the orientation of the shape.
   */
    orient: "top" | "right" | "bottom" | "left";

    /**
   * Sets the padding between each tick label to the specified number.
   */
    padding: number;

    /**
   * Sets the inner padding of band scale to the specified number.
   */
    paddingInner: number;

    /**
   * Sets the outer padding of band scales to the specified number.
   */
    paddingOuter: number;

    /**
   * Sets the scale range (in pixels) of the axis.
   * The given array must have 2 values, but one may be undefined to allow the default behavior for that value.
   */
    range: [number, number] | [number, undefined] | [undefined, number];

    /**
   * Sets the scale of the axis.
   * This property uses terminology from [d3-scale](https://github.com/d3/d3-scale).
   */
    scale:
      | "band"
      | "diverging"
      | "diverginglog"
      | "divergingpow"
      | "divergingsqrt"
      | "divergingsymlog"
      | "identity"
      | "implicit"
      | "linear"
      | "log"
      | "ordinal"
      | "point"
      | "pow"
      | "quantile"
      | "quantize"
      | "radial"
      | "sequential"
      | "sequentiallog"
      | "sequentialpow"
      | "sequentialquantile"
      | "sequentialsqrt"
      | "sequentialsymlog"
      | "sqrt"
      | "symlog"
      | "threshold"
      | "time"
      | "utc";

    /**
   * Sets the “padding” property of the scale, often used in point scales.
   */
    scalePadding: number;

    /**
   * Sets the tick shape constructor.
   */
    shape: "Line" | "Circle" | "Rect";

    /**
   * Sets the tick style of the axis.
   */
    shapeConfig:
      | Partial<ShapeLineConfig>
      | Partial<ShapeCircleConfig>
      | Partial<ShapeRectConfig>;

    /**
   * Sets the tick formatter.
   */
    tickFormat: (d: number) => string;

    /**
   * Sets the tick values of the axis.
   */
    ticks: number[] | string[];

    /**
   * Sets the tick size of the axis.
   */
    tickSize: number;

    /**
   * Sets the tick specifier for the tickFormat function.
   */
    tickSpecifier: string;

    /**
   * Sets the behavior of the abbreviations when you are using linear scale. This method accepts two options: “normal” (uses formatAbbreviate to determinate the abbreviation) and “smallest” (uses suffix from the smallest tick as reference in every tick).
   */
    tickSuffix: string;

    /**
   * Defines a custom locale object to be used in time scale. This object must include the following properties: dateTime, date, time, periods, days, shortDays, months, shortMonths. For more information, you can revise d3p.d3-time-format.
   */
    timeLocale: TimeLocaleDefinition;

    /**
   * Sets the title of the axis.
   */
    title: string;

    /**
   * Sets the title configuration of the axis.
   */
    titleConfig: Partial<CSSStyleDeclaration>;

    /**
   * Sets the overall width of the axis.
   */
    width: number;
  }
}
