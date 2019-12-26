import React, {Component} from "react";
import {hot} from "react-hot-loader/root";
import "./Tile.css";

class Tile extends Component {
  render() {
    const {
      El,           // the element used as the container (it's an li by default)
      link,         // direct link
      slug,         // profile type
      id,           // profile id
      title,        // profile name
      theme         // can be used for style overrides
    } = this.props;

    return (
      <El className={`cp-tile${theme ? ` ${theme}-theme` : ""}`}>
        <a className="cp-tile-link" href={link}>
          <span className={`cp-tile-title heading ${
            title.length > 30 || title.match(/\w+/).toString().length > 25
              ? "u-font-xs"
              : "u-font-sm"
          }`} title={title}>
            {title}
          </span>
          <div className="cp-tile-cover-img" style={{backgroundImage: `url(/api/image?slug=${slug}&id=${id})`}} />
        </a>
      </El>
    );
  }
}

Tile.defaultProps = {
  title: "undefined `title` prop in Tile.jsx",
  El: "li"
};

export default hot(Tile);
