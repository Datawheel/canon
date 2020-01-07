import React, {Component} from "react";
import PropTypes from "prop-types";
import {Link} from "react-router";
import axios from "axios";
import linkify from "../../utils/linkify";
import "./ProfileSearch.css";
import {Icon} from "@blueprintjs/core";
import {uuid} from "d3plus-common";
import {titleCase} from "d3plus-text";
import {max} from "d3-array";

const lowercase = ["a", "an", "and", "as", "at", "but", "by", "for", "from", "if", "in", "into", "near", "nor", "of", "on", "onto", "or", "per", "that", "the", "to", "with", "via", "vs", "vs."];
const uppercase = ["CEO", "CFO", "CNC", "COO", "CPU", "GDP", "HVAC", "ID", "IT", "R&D", "TV", "UI"];

/** Sanitizes Titles */
function formatTitle(title) {
  const focusWords = title.match(/\w+/g)
    .filter(t => !lowercase.includes(t) && !uppercase.includes(t));
  const allUppercase = focusWords.every(t => t.toUpperCase() === t);
  const allLowercase = focusWords.every(t => t.toLowerCase() === t);
  if (allLowercase || allUppercase) return titleCase(title);
  return title;
}

/** Determines font-size based on title */
function titleSize(title) {
  const length = title.length;
  const longestWord = max(title.match(/\w+/g).map(t => t.length));
  if (length > 30 || longestWord > 25) return "sm";
  if (length > 20 || longestWord > 15) return "md";
  return "lg";
}

class ProfileSearch extends Component {

  constructor(props) {
    super(props);
    this.state = {
      id: uuid(),
      query: "",
      results: false,
      timeout: 0,
      url: false
    };
  }

  createLink(result) {
    const {router} = this.context;
    const link = linkify(router, result);
    return link;
  }

  onChange(e) {

    const {timeout} = this.state;
    const {minQueryLength} = this.props;
    const query = e ? e.target.value : this.state.query;
    clearTimeout(timeout);

    if (query.length < minQueryLength) {
      this.setState({results: false, query});
    }
    else {

      const url = `/api/deepsearch?query=${query}`;

      // handle the query
      this.setState({
        // set query separately to avoid input lag
        query,
        // make the request on a timeout
        timeout: setTimeout(() => {

          axios.get(url)
            .then(resp => {
              if (url === this.state.url) this.setState({results: resp.data});
            });

        }, 200),
        url
      });
    }
  }



  onKeyDown(e) {

    switch(e.keyCode) {
      case 13: // ENTER
        return this.onChange.bind(this)();
      case 27: // ESC
        return this.resetSearch.bind(this)();
    }

  }

  resetSearch(e) {
    this.setState({
      query: "",
      results: false
    });
  }

  render() {

    const {query, results} = this.state;

    const {
      display,
      inputFontSize,
      limit
    } = this.props;

    console.log(results);

    return (
      <div className="cms-profilesearch">

        <label className="cp-input-label">
          {/* accessibility text */}
          <span className="u-visually-hidden" key="slt">
            Search profiles
          </span>

          {/* the input */}
          <input
            className={`cp-input u-font-${inputFontSize}`}
            placeholder="Search profiles..."
            value={query}
            onChange={this.onChange.bind(this)}
            onKeyDown={this.onKeyDown.bind(this)}
            ref={input => this.textInput = input}
            key="sli"
            type="text"
          />

          {/* search icon (keep after input so it can be easily styled input hover/focus) */}
          <Icon className="cms-profilesearch-icon u-font-xxl" icon="search" key="slii" />

          {/* close button */}
          <button
            className={`cms-profilesearch-reset-button ${query ? "is-visible" : "is-hidden"}`}
            tabIndex={query ? 0 : -1}
            onClick={this.resetSearch.bind(this)}
            key="slb"
          >
            <Icon className="cms-profilesearch-reset-button-icon" icon="cross" />
            <span className="cms-profilesearch-reset-button-text">reset</span>
          </button>
        </label>

        <div className="cms-profilesearch-container">
          {
            results
            ? (() => {

              switch(display) {

                case "columns":
                  return (
                    <ul className="cms-profilesearch-columns">
                      {Object.keys((results.profiles || {})).map((profile, i) => {
                        const data = (results.profiles[profile] || []);
                        return (
                          <li key={`p-${i}`} className={`cms-profilesearch-column ${data.length > 0 ? "is-active" : "is-empty"}`}>
                            <h3 className="cms-profilesearch-column-title">{profile}</h3>
                            <ul className="cms-profilesearch-column-list">
                              {data.slice(0, limit).map((result, j) => {
                                return (
                                  <li key={`r-${j}`} className="cms-profilesearch-tile">
                                    <Link to={this.createLink(result)} className="cms-profilesearch-tile-link">
                                      {result.map((r, i) => {
                                        const title = formatTitle(r.name);
                                        return (
                                          <React.Fragment>
                                            { i > 0 && <span className="cms-profilesearch-joiner u-font-md">&amp;</span> }
                                            <span className={`cms-profilesearch-tile-link-title heading u-font-${titleSize(title)}`}>
                                              {title}
                                            </span>
                                          </React.Fragment>
                                        );
                                      })}
                                    </Link>
                                    <div className="cms-profilesearch-tile-image-container">
                                      {result.map(r => <div className="cms-profilesearch-tile-image"
                                        style={{backgroundImage: `url(api/image?slug=${r.slug}&id=${r.id}&size=thumb)`}} />)}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </li>
                        );
                      })}
                    </ul>
                  );

                case "list":
                  return (
                    <ul className="cms-profilesearch-list">
                      {(results.grouped || []).slice(0, limit).map((result, i) => <li key={`r-${i}`}>{this.createLink(result)}</li>)}
                    </ul>
                  );

              }

            })()
            : <span>Please Search</span>
          }
        </div>
      </div>
    );
  }

}

ProfileSearch.contextTypes = {
  router: PropTypes.object
};

ProfileSearch.defaultProps = {
  display: "list",
  inputFontSize: "xxl",
  limit: 10,
  minQueryLength: 1
};

export default ProfileSearch;
