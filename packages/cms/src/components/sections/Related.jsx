import React, {Component} from "react";
import {hot} from "react-hot-loader/root";
import stripP from "../../utils/formatters/stripP";
import Tile from "./components/Tile";

import "./Related.css";

class Related extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tiles: []
    };
  }

  componentDidMount() {
    const {profiles} = this.props;

    // make sure we got profiles
    if (profiles && profiles.length) {

      // get the domain, for generating links
      let {domain} = this.props;
      if (typeof domain === "undefined" && typeof window !== "undefined" && window.document.location.origin) {
        domain = window.document.location.origin;
      }
      else {
        if (typeof domain === "undefined" && typeof window !== "undefined") {
          domain = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ""}`;
        }
      }

      // generate tiles from profiles array
      const tiles = profiles.map(profile => ({
        title: this.getTitle(profile),
        link: this.generateLink(domain, profile.dims),
        images: this.getImages(profile.dims, profile)
      }));

      this.setState({tiles});
    }

    return null;
  }

  /** grab the title from the hero section */
  getTitle(profile) {
    if (profile.sections && profile.sections[0]) {
      return stripP(profile.sections[0].title);
    }
    return console.log("unable to find hero section title in getTitle()");
  }

  /** pass the domain and dimensions and create a link to a profile */
  generateLink(domain, dimensions) {
    if (domain && dimensions) {
      return `${domain}/profile/${dimensions
        .map(dim => `${dim.slug}/${dim.memberSlug || dim.id}/`)
        .reduce((acc, d) => acc += d, "")
      }`;
    }
    return console.log("undefined `domain` or `dimensions` argument in generateLink()");
  }

  /** pass the dimensions & profile and return a list of associated images */
  getImages(
    dimensions,
    profile,
    size = "thumb" // or "splash"
  ) {
    const images = [];

    if (dimensions && profile) {
      for (let i = 0; i < dimensions.length; i++) {
        if (profile.images[i]) {
          images.push({
            src: `/api/image?slug=${dimensions[i].slug}&id=${dimensions[i].id}&type=${size}`
          });
        }
      }

      return images;
    }
    return console.log("undefined `dimensions` or `profile` argument in getImages()");
  }

  render() {
    const {tiles} = this.state;

    // no related profiles or malformed tiles; don't show the section
    if (tiles.length === 0 || !tiles[0].title || !tiles[0].link) return null;

    return (
      <section className="cp-related">
        <h2 className="cp-section-heading cp-related-heading">Related profiles:</h2>
        <ul className="cp-related-tile-list" key="tl">
          {tiles.map(tile =>
            <Tile {...tile} key={tile.title} />
          )}
        </ul>
      </section>
    );
  }
}

export default hot(Related);
