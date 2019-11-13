import {AxisConfig} from "d3plus-axis";
import {Accessor} from "d3plus-common";
import {
  AnyShapeConfig,
  ShapeAreaConfig,
  ShapeBarConfig,
  ShapeBoxConfig,
  ShapeCircleConfig,
  ShapeLineConfig,
  ShapePathConfig,
  ShapeRectConfig,
  SpecificShapeConfig
} from "d3plus-shape";

export interface D3plusConfig {
  /**
   * Allows drawing custom shapes to be used as annotations in the provided x/y plot.
   * This method accepts custom config objects for the Shape class,
   * either a single config object or an array of config objects.
   * Each config object requires an additional parameter, the “shape”, which
   * denotes which Shape sub-class to use (Rect, Line, etc).
   * Annotations will be drawn underneath the data to be displayed.
   */
  annotations: Array<
    | ({shape: "Area"} & Partial<ShapeAreaConfig>)
    | ({shape: "Bar"} & Partial<ShapeBarConfig>)
    | ({shape: "Box"} & Partial<ShapeBoxConfig>)
    | ({shape: "Circle"} & Partial<ShapeCircleConfig>)
    | ({shape: "Line"} & Partial<ShapeLineConfig>)
    | ({shape: "Path"} & Partial<ShapePathConfig>)
    | ({shape: "Rect"} & Partial<ShapeRectConfig>)
  >;

  /**
   * A d3plus-shape configuration Object used for styling the background
   * rectangle of the inner x/y plot (behind all of the shapes and gridlines).
   */
  backgroundConfig: Partial<ShapeRectConfig>;

  /**
   * Sets the discrete accessor to the specified method name (usually an axis).
   */
  discrete: Accessor<"x" | "y" | "x2" | "y2">;

  /**
   * Sets the config method for each shape.
   */
  shapeConfig: Partial<AnyShapeConfig> & Partial<SpecificShapeConfig>;

  /**
   * Toggles shape stacking.
   */
  stacked: boolean;

  /**
   * Sets the accessor to the values used in the x-axis.
   */
  x: Accessor<string>;

  /**
   * Sets the accessor to the values used in the secondary x-axis.
   */
  x2: Accessor<string>;

  /**
   * Sets the config method for the x-axis.
   */
  xConfig: Partial<AxisConfig>;

  /**
   * Sets the config method for the secondary x-axis.
   */
  x2Config: Partial<AxisConfig>;

  /**
   * Sets the accessor to the values used in the y-axis.
   */
  y: Accessor<string>;

  /**
   * Sets the accessor to the values used in the secondary y-axis.
   */
  y2: Accessor<string>;

  /**
   * Sets the config method for the y-axis.
   */
  yConfig: Partial<AxisConfig>;

  /**
   * Sets the config method for the secondary y-axis.
   */
  y2Config: Partial<AxisConfig>;

  barPadding;
  baseline;
  confidence;
  confidenceConfig;
  discrete;
  discreteCutoff;
  groupPadding;
  shapeSort;
  size;
  sizeMax;
  sizeMin;
  sizeScale;
  stacked;
  stackOffset;
  stackOrder;
  xCutoff;
  xDomain;
  x2Domain;
  xSort;
  x2Sort;
  yCutoff;
  yDomain;
  y2Domain;
  ySort;
  y2Sort;

  groupBy: Accessor<string>[];
  time;
  total;
  colorScale;
  colorScaleConfig;
  colorScalePosition;

  activeStyle: Partial<CSSStyleDeclaration>;
  arrowStyle: Partial<CSSStyleDeclaration>;
  bodyStyle: Partial<CSSStyleDeclaration>;
  buttonStyle: Partial<CSSStyleDeclaration>;
  footerStyle: Partial<CSSStyleDeclaration>;
  hoverStyle: Partial<CSSStyleDeclaration>;
  labelStyle: Partial<CSSStyleDeclaration>;
  legendStyle: Partial<CSSStyleDeclaration>;
  messageStyle: Partial<CSSStyleDeclaration>;
  optionStyle: Partial<CSSStyleDeclaration>;
  radioStyle: Partial<CSSStyleDeclaration>;
  selectStyle: Partial<CSSStyleDeclaration>;
  tableStyle: Partial<CSSStyleDeclaration>;
  tbodyStyle: Partial<CSSStyleDeclaration>;
  theadStyle: Partial<CSSStyleDeclaration>;
  titleStyle: Partial<CSSStyleDeclaration>;
  trStyle: Partial<CSSStyleDeclaration>;
  zoomBrushHandleStyle: Partial<CSSStyleDeclaration>;
  zoomBrushSelectionStyle: Partial<CSSStyleDeclaration>;
  zoomControlStyle: Partial<CSSStyleDeclaration>;
}
