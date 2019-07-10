import React, {Component} from "react";
import stripP from "../../../utils/formatters/stripP";

/** Quill editor likes to generate <p> and <br> tags, boy is that fun. */
export default class Parse extends Component {
  render() {
    const {
      El,        // the element to render
      split,     // if there's a <br> tag, create another element (default) or replace it with a space
      className, // class given to each generated element
      children   // content to parse; one blob of content expected
    } = this.props;

    let blob = children;

    // By default, split into separate elements at br tags. If there is a br tag. Unless it's a heading tag.
    if (split === true &&
      blob.indexOf("<br>") !== -1 &&
      El !== "h1" &&
      El !== "h2" &&
      El !== "h3" &&
      El !== "h4" &&
      El !== "h5" &&
      El !== "h6"
    ) {
      blob = blob.split("<br>");
    }
    // Otherwise, just remove the br tag, and convert the blob to an array with one entry
    else {
      blob = Array.of(blob.replace(/\<br\>/g, " "));
    }

    return (
      <React.Fragment>
        {blob.map((el, i) =>
          <El key={`${el}-${El}-${i}`} className={className} dangerouslySetInnerHTML={{__html: stripP(el)}} />
        )}
      </React.Fragment>
    );
  }
}

Parse.defaultProps = {
  El: "p",
  split: true,
  children: "missing `children` prop in Parse.jsx; single blob of Quill content expected"
};
