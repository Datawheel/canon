declare module "d3plus-shape" {
  export interface ShapeConfig {
    /**
   * *TODO*
   * Sets the highlight accessor.
   */
    active;

    /**
   * When shapes are active, this is the opacity of any shape that is not active.
   */
    activeOpacity: string | number;

    /**
   * The style to apply to active shapes.
   */
    activeStyle: Partial<CSSStyleDeclaration>;

    /**
   * Sets the aria-label attribute.
   */
    ariaLabel: Accessor<string>;

    /**
   * Sets the background-image for the shape.
   */
    backgroundImage: Accessor<string>;

    /**
   * Sets the data array to the specified array.
   * A shape will be drawn for each object in the array.
   */
    data: any[];

    /**
   * Sets the animation duration to the specified number, in milliseconds.
   */
    duration: number;

    /**
   * Defines the “fill” attribute for the shapes.
   */
    fill: Accessor<ColorProperty>;

    /**
   * Defines the “fill-opacity” attribute for the shapes.
   */
    fillOpacity: Accessor<string | number>;

    /**
   * *TODO*
   * Sets the highlight accessor.
   */
    hover;

    /**
   * The style to apply to hovered shapes.
   */
    hoverStyle: Partial<CSSStyleDeclaration>;

    /**
   * Sets the hover opacity.
   */
    hoverOpacity: string | number;

    /**
   * Sets the mouse hit area.
   */
    hitArea: Accessor<{width: number; height: number; x: number; y: number}>;

    /**
   * Sets the id accessor for the shape.
   */
    id: Accessor<string>;

    /**
   * Sets the label accessor for the shape.
   */
    label: Accessor<string | string[]>;

    /**
   * Sets the label bounds.
   */
    labelBounds: Accessor<{width: number; height: number; x: number; y: number}>;

    /**
   * A pass-through to the config method of the TextBox class used to create a shape’s labels.
   */
    labelConfig: Partial<TextBoxConfig>;

    /**
   * Sets the opacity accessor for the shape.
   */
    opacity: Accessor<string | number>;

    /**
   * Sets the pointerEvents accessor for the shape.
   */
    pointerEvents: Accessor<PointerEventsProperty>;

    /**
   * Sets the role attribute for the SVG element of the shape.
   */
    role: Accessor<string>;

    /**
   * Sets the rotate accessor for the shape.
   */
    rotate: Accessor<number>;

    /**
   * Defines the “rx” attribute for the shapes.
   */
    rx: Accessor<number>;

    /**
   * Defines the “rx” attribute for the shapes.
   */
    ry: Accessor<number>;

    /**
   * Sets the scale accessor for the shape.
   */
    scale: Accessor<number>;

    /**
   * Sets the shape-rendering accessor for the shape.
   */
    shapeRendering: Accessor<ShapeRenderingProperty>;

    /**
   * Sets the sort comparator.
   */
    sort: false | ((a: any, b: any) => number);

    /**
   * Defines the “stroke” attribute for the shapes.
   */
    stroke: Accessor<ColorProperty>;

    /**
   * Defines the “stroke-dasharray” attribute for the shapes.
   */
    strokeDasharray: Accessor<StrokeDasharrayProperty<string>>;

    /**
   * Defines the “stroke-linecap” attribute for the shapes.
   * Accepted values are "butt", "round", and "square".
   */
    strokeLinecap: Accessor<StrokeLinecapProperty>;

    /**
   * Defines the “stroke-opacity” attribute for the shapes.
   */
    strokeOpacity: Accessor<string | number>;

    /**
   * Sets the stroke-width accessor for the shapes.
   */
    strokeWidth: Accessor<number>;

    /**
   * Sets the text-anchor accessor for the shapes.
   */
    textAnchor: Accessor<TextAnchorProperty>;

    /**
   * Sets the vector-effect accessor for the shapes.
   */
    vectorEffect: Accessor<VectorEffectProperty>;

    /**
   * Sets the vertical alignment accessor for the shapes.
   */
    verticalAlign: Accessor<VerticalAlignProperty<string>>;

    /**
   * Sets the x position for each box to the specified accessor function or static number.
   * The number given should correspond to the left side of the drawing area.
   */
    x: Accessor<number>;

    /**
   * Sets the y position for each box to the specified accessor function or static number.
   * The number given should correspond to the top side of the drawing area.
   */
    y: Accessor<number>;
  }

  export interface ShapeAreaConfig extends ShapeConfig {
    /**
   * TODO: Investigate.
   */
    curve;

    /**
   * TODO: Investigate.
   */
    defined;

    /**
   * TODO: Investigate.
   */
    x;

    /**
   * TODO: Investigate.
   */
    x0;

    /**
   * TODO: Investigate.
   */
    x1;

    /**
   * TODO: Investigate.
   */
    y;

    /**
   * TODO: Investigate.
   */
    y0;

    /**
   * TODO: Investigate.
   */
    y1;
  }

  export interface ShapeBarConfig extends ShapeConfig {
    /**
   *
   */
    height;

    /**
   *
   */
    width;

    /**
   *
   */
    x0;

    /**
   *
   */
    x1;

    /**
   *
   */
    y0;

    /**
   *
   */
    y1;
  }

  export interface ShapeBoxConfig extends ShapeConfig {
    active;
    data;
    hover;
    medianConfig;
    orient;
    outlier;
    outlierConfig;
    rectConfig: Partial<ShapeRectConfig>;
    rectWidth: Accessor<number>;
    select;
    whiskerConfig;
    whiskerMode;
    x;
    y;
  }

  export interface ShapeCircleConfig extends ShapeConfig {}

  export interface ShapeLineConfig extends ShapeConfig {}

  export interface ShapePathConfig extends ShapeConfig {}

  export interface ShapeRectConfig extends ShapeConfig {}

  export type AnyShapeConfig =
    | ShapeAreaConfig
    | ShapeBarConfig
    | ShapeBoxConfig
    | ShapeCircleConfig
    | ShapeLineConfig
    | ShapePathConfig
    | ShapeRectConfig;

  export interface SpecificShapeConfig {
    Area: Partial<ShapeAreaConfig>;
    Bar: Partial<ShapeBarConfig>;
    Box: Partial<ShapeBoxConfig>;
    Circle: Partial<ShapeCircleConfig>;
    Line: Partial<ShapeLineConfig>;
    Path: Partial<ShapePathConfig>;
    Rect: Partial<ShapeRectConfig>;
  }
}
