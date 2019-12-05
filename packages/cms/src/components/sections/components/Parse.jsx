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

    let blob = children.replace(/<p><br><\/p>/g, "<br/>");

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

    // loop through all elements in the blob
    return blob.map((el, i) =>
      // ordered list
      el.indexOf("<ol>") !== -1
        ? <ol
          className={className}
          key={`${el}-${El}-${i}`}
          dangerouslySetInnerHTML={{__html: stripOL(el)}}
          tabIndex={tabIndex}
        />

        // unordered list
        : el.indexOf("<ul>") !== -1
          ? <ul
            className={className}
            key={`${el}-${El}-${i}`}
            dangerouslySetInnerHTML={{__html: stripUL(el)}}
            tabIndex={tabIndex}
          />

          // inline code block
          : el.indexOf(`<pre class="ql-syntax" spellcheck="false">`) !== -1
            ? <p
              className={className}
              key={`${el}-${El}-${i}`}
              dangerouslySetInnerHTML={{__html: el}}
              tabIndex={tabIndex}
            />

            // quote
            : el.indexOf("<blockquote>") !== -1
              ? <blockquote
                className={className}
                key={`${el}-${El}-${i}`}
                dangerouslySetInnerHTML={{__html: el}}
                tabIndex={tabIndex}
              />

              // anything else
              : <El
                className={className}
                dangerouslySetInnerHTML={{__html: stripP(el)}}
                id={id && i === 0 ? id : null}
                key={`${el}-${El}-${i}`}
                tabIndex={tabIndex}
              />
    );
  }
}

Parse.defaultProps = {
  El: "p",
  split: true,
  children: "missing `children` prop in Parse.jsx; single blob of Quill content expected"
};
