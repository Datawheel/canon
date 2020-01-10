import React, {Component} from "react";
import PropTypes from "prop-types";
import {Link} from "react-router";
import linkify from "../../utils/linkify";
import profileTitleFormat from "../../utils/profileTitleFormat";
import {max} from "d3-array";
import "./ProfileTile.css";

/** Determines font-size based on title */
function titleSize(title) {
  const length = title.length;
  const longestWord = max(length ? title.match(/\w+/g).map(t => t.length) : 0);
  if (length > 30 || longestWord > 25) return "sm";
  if (length > 20 || longestWord > 15) return "md";
  return "lg";
}

class ProfileTile extends Component {

  render() {

    const {router} = this.context;

    const {
      data,
      joiner
    } = this.props;

    return (
      <li className="cms-profilesearch-tile">
        <Link to={linkify(router, data)} className="cms-profilesearch-tile-link">
          {data.map((r, i) => {
            const title = profileTitleFormat(r.name);
            return (
              <React.Fragment>
                { i > 0 && <span className="cms-profilesearch-tile-link-joiner u-font-md">{joiner}</span> }
                <div className="cms-profilesearch-tile-link-text">
                  <div className={`cms-profilesearch-tile-link-title heading u-font-${titleSize(title)}`}>{title}</div>
                  <div className="cms-profilesearch-tile-link-sub u-margin-top-xs u-font-xs">{r.memberHierarchy}</div>
                </div>
              </React.Fragment>
            );
          })}
        </Link>
        <div className="cms-profilesearch-tile-image-container">
          {data.map(r => <div className="cms-profilesearch-tile-image"
            style={{backgroundImage: `url(api/image?slug=${r.slug}&id=${r.id}&size=thumb)`}} />)}
        </div>
      </li>
    );
  }

}

ProfileTile.contextTypes = {
  router: PropTypes.object
};

ProfileTile.defaultProps = {
  joiner: "&"
};

export default ProfileTile;
