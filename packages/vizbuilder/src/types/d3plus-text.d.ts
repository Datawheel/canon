declare module "d3plus-text" {
  export interface TextBoxConfig {
    /**
   * Sets the aria-hidden attribute to the specified function or string.
   */
    ariaHidden: Accessor<string>;

    /**
   * Sets the data array to the specified array.
   * A text box will be drawn for each object in the array.
   */
    data: any[];

    /**
   * Sets the animation delay to the specified number in milliseconds.
   */
    delay: number;

    /**
   * Sets the animation duration to the specified number in milliseconds.
   */
    duration: number;

    /**
   * Sets the function that handles what to do when a line is truncated.
   * It should return the new value for the line.
   * By default, an ellipsis is added to the end of any line except if it is the first word that cannot fit (in that case, an empty string is returned).
   *
   * @param string the String of text for the line in question
   * @param line the number of the line.
   */
    ellipsis: string | ((text: string, line: number) => string);

    /**
   * Sets the font color to the specified accessor function or static string, which is inferred from the DOM selection by default.
   */
    fontColor: Accessor<ColorProperty>;

    /**
   * Defines the font-family to be used.
   * The value passed can be either a String name of a font, a comma-separated list of font-family fallbacks, an Array of fallbacks, or a Function that returns either a String or an Array.
   * If supplying multiple fallback fonts, the fontExists function will be used to determine the first available font on the client’s machine.
   */
    fontFamily: Accessor<string | string[]>;

    /**
   * Sets the maximum font size to the specified accessor function or static number (which corresponds to pixel units), which is used when dynamically resizing fonts.
   */
    fontMax: Accessor<number>;

    /**
   * Sets the minimum font size to the specified accessor function or static number (which corresponds to pixel units), which is used when dynamically resizing fonts.
   */
    fontMin: Accessor<number>;

    /**
   * Sets the font opacity to the specified accessor function or static number between 0 and 1.
   */
    fontOpacity: Accessor<string | number>;

    /**
   * Toggles font resizing, which can either be defined as a static boolean for all data points, or an accessor function that returns a boolean. See this example for a side-by-side comparison.
   */
    fontResize: Accessor<boolean>;

    /**
   * Sets the font size to the specified accessor function or static number (which corresponds to pixel units), which is inferred from the DOM selection by default.
   */
    fontSize: Accessor<string | number>;

    /**
   * Sets the font weight to the specified accessor function or static number, which is inferred from the DOM selection by default.
   */
    fontWeight: Accessor<FontWeightProperty>;

    /**
   * Sets the height for each box to the specified accessor function or static number.
   */
    height: Accessor<number>;

    /**
   * Configures the ability to render simple HTML tags.
   * Defaults to supporting <b>, <strong>, <i>, and <em>, set to false to disable or provide a mapping of tags to svg styles.
   */
    html: false | Record<keyof HTMLElementTagNameMap, string>;

    /**
   * Defines the unique id for each box to the specified accessor function or static number.
   */
    id: Accessor<string | number>;

    /**
   * Sets the line height to the specified accessor function or static number, which is 1.2 times the font size by default.
   */
    lineHeight: Accessor<number>;

    /**
   * Restricts the maximum number of lines to wrap onto, which is null (unlimited) by default.
   */
    maxLines: Accessor<number>;

    /**
   * Sets the text overflow to the specified accessor function or static boolean.
   */
    overflow: Accessor<false | OverflowProperty>;

    /**
   * Sets the padding to the specified accessor function, CSS shorthand string, or static number, which is 0 by default.
   */
    padding: Accessor<string | number>;

    /**
   * Sets the pointer-events to the specified accessor function or static string.
   */
    pointerEvents: Accessor<PointerEventsProperty>;

    /**
   * Sets the rotate percentage for each box to the specified accessor function or static string.
   */
    rotate: Accessor<number>;

    /**
   * Sets the anchor point around which to rotate the text box.
   */
    rotateAnchor: Accessor<[number, number]>;

    /**
   * Sets the word split behavior to the specified function, which when passed a string is expected to return that string split into an array of words.
   */
    split: (line: string) => string[];

    /**
   * Sets the text for each box to the specified accessor function or static string.
   */
    text: Accessor<string>;

    /**
   * Sets the horizontal text anchor to the specified accessor function or static string, whose values are analagous to the SVG text-anchor property.
   */
    textAnchor: Accessor<TextAnchorProperty>;

    /**
   * Sets the vertical alignment to the specified accessor function or static string. Accepts "top", "middle", and "bottom".
   */
    verticalAlign: Accessor<VerticalAlignProperty>;

    /**
   * Sets the width for each box to the specified accessor function or static number.
   */
    width: Accessor<number>;

    /**
   * Sets the x position for each box to the specified accessor function or static number.
   * The number given should correspond to the left side of the textBox.
   */
    x: Accessor<number>;

    /**
   * Sets the y position for each box to the specified accessor function or static number.
   * The number given should correspond to the top side of the textBox.
   */
    y: Accessor<number>;
  }
}
