import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {Link} from "react-router";
import linkify from "../../utils/linkify";
import {formatTitle} from "../../utils/profileTitleFormat";
import {max} from "d3-array";
import {trim} from "d3plus-text";
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
    const {locale} = this.props;

    const {
      data,
      joiner,
      subtitleFormat
    } = this.props;

    return (
      <li className="cms-profilesearch-tile">
        <Link to={linkify(router, data, locale)} className="cms-profilesearch-tile-link">
          {data.map((r, i) => {
            const title = formatTitle(r.name);
            return (
              <React.Fragment key={`tile-entity-${i}`}>
                { i > 0 && <span className="cms-profilesearch-tile-link-joiner u-font-md">{trim(joiner)}</span> }
                <div className="cms-profilesearch-tile-link-text">
                  <div className={`cms-profilesearch-tile-link-title heading u-font-${titleSize(title)}`}>{title}</div>
                  <div className="cms-profilesearch-tile-link-sub u-margin-top-xs u-font-xs">{subtitleFormat(r)}</div>
                </div>
              </React.Fragment>
            );
          })}
        </Link>
        <div className="cms-profilesearch-tile-image-container">
          {data.map(r => <div key={`tile-image-${r.id}`}
            className="cms-profilesearch-tile-image"
            style={{backgroundImage: `url(/api/image?slug=${r.slug}&id=${r.id}&size=thumb)`}} />)}
        </div>
      </li>
    );
  }

}

ProfileTile.contextTypes = {
  router: PropTypes.object
};

ProfileTile.defaultProps = {
  joiner: " & ",
  subtitleFormat: d => d.memberHierarchy
};

export default connect(state => ({
  locale: state.i18n.locale
}))(ProfileTile);
