import React, {Component} from "react";
import stripP from "../../../utils/formatters/stripP";
import stripUL from "../../../utils/formatters/stripUL";
import stripOL from "../../../utils/formatters/stripOL";

/** Quill editor likes to generate <p> and <br> tags, boy is that fun. */
export default class Parse extends Component {
  render() {
    const {
      El,        // the element to render
      split,     // if there's a <br> tag, create another element (default) or replace it with a space
      className, // class given to each generated element
      id,        // mostly for section anchors
      children,  // content to parse; one blob of content expected
      tabIndex   // when you need to make the element focusable
    } = this.props;

    let blob = children.toString().replace(/<p><br><\/p>/g, "<br/>");

    // By default, split into separate elements at br tags. If there is a br tag. Unless it's a heading tag.
    if (split === true &&
      blob.indexOf("<br/>") !== -1 &&
      El !== "h1" &&
      El !== "h2" &&
      El !== "h3" &&
      El !== "h4" &&
      El !== "h5" &&
      El !== "h6"
    ) {
      blob = blob.split("<br/>");
    }
    // Otherwise, just remove the br tag, and convert the blob to an array with one entry
    else {
      blob = Array.of(blob.replace(/\<br\>/g, " "));
    }

    // props to spread
    const commonProps = {
      className,
      tabIndex
    };

    // loop through all elements in the blob
    return blob.map((el, i) =>
      // ordered list
      el.indexOf("<ol>") !== -1
        ? <ol dangerouslySetInnerHTML={{__html: stripOL(el)}} key={`${el}-${El}-${i}`} {...commonProps} />

        // unordered list
        : el.indexOf("<ul>") !== -1
          ? <ul dangerouslySetInnerHTML={{__html: stripUL(el)}} key={`${el}-${El}-${i}`} {...commonProps} />

          // inline code block
          : el.indexOf(`<pre class="ql-syntax" spellcheck="false">`) !== -1
            ? <p dangerouslySetInnerHTML={{__html: el}} key={`${el}-${El}-${i}`} {...commonProps} />

            // quote
            : el.indexOf("<blockquote>") !== -1
              ? <blockquote dangerouslySetInnerHTML={{__html: el}} key={`${el}-${El}-${i}`} {...commonProps} />

              // anything else
              : <El
                dangerouslySetInnerHTML={{__html: stripP(el)}}
                id={id && i === 0 ? id : null}
                key={`${el}-${El}-${i}`}
                {...commonProps}
              />
    );
  }
}

Parse.defaultProps = {
  El: "p",
  split: true,
  children: "missing `children` prop in Parse.jsx; single blob of DraftJS content expected"
};
