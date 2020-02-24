import React, {Component} from "react";
import PropTypes from "prop-types";
import {hot} from "react-hot-loader/root";
import {connect} from "react-redux";
import linkify from "../../utils/linkify";
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
    const {profiles, locale} = this.props;
    const {router} = this.context;

    // make sure we got profiles
    if (profiles && profiles.length) {
      // generate tiles from profiles array
      const tiles = profiles.map(profile => ({
        title: profile.length === 1 ? profile[0].name : `${profile[0].name} / ${profile[1].name}`,
        link: linkify(router, profile, locale),
        images: profile.map(d => ({src: `/api/image?slug=${d.slug}&id=${d.id}&size=thumb`}))
      }));

      this.setState({tiles});
    }

    return null;
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

Related.contextTypes = {
  router: PropTypes.object
};

export default connect(state => ({
  locale: state.i18n.locale
}))(hot(Related));
