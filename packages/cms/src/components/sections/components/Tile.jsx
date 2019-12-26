import React, {Component} from "react";
import {hot} from "react-hot-loader/root";
import "./Tile.css";

class Tile extends Component {
  render() {
    const {
      El,     // the element used as the container (it's an li by default)
      link,   // direct link
      images, // list of images
      title,  // profile name
      theme   // can be used for style overrides
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

          <div className="cp-tile-img-outer">
            <div className="cp-tile-img-overlay" />
            {images && images.length &&
              <div className="cp-tile-img-grid">
                {images.map(img => img.src &&
                  <div className="cp-tile-img-wrapper" key={img.src}>
                    <div className="cp-tile-img" style={{backgroundImage: `url(${img.src})`}} />
                  </div>
                )}
              </div>
            }
          </div>
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
