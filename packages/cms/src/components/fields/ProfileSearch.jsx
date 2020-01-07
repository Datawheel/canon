import React, {Component} from "react";
import PropTypes from "prop-types";
import axios from "axios";
import linkify from "../../utils/linkify";
import "./ProfileSearch.css";
import {Icon} from "@blueprintjs/core";
import {uuid} from "d3plus-common";

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
    const name = result.map(d => d.name).join("/");
    return <a href={link}>{`${name} (${result[0].avg || result[0].ranking})`}</a>;
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

      const url = `/api/profilesearch?query=${query}&limit=100`;

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

    const {display, inputFontSize} = this.props;

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
                    <React.Fragment>{Object.keys((results.profiles || {})).map((profile, i) =>
                      <div key={`p-${i}`}>
                        <h3>{profile}</h3>
                        <ul className="cms-profilesearch-list">
                          {(results.profiles[profile] || []).map((result, j) =>
                            <li key={`r-${j}`}>{this.createLink(result)}</li>
                          )}
                        </ul>
                      </div>
                    )}</React.Fragment>
                  );

                default:
                  return (
                    <ul className="cms-profilesearch-list">
                      {(results.grouped || []).map((result, i) => <li key={`r-${i}`}>{this.createLink(result)}</li>)}
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
  minQueryLength: 1
};

export default ProfileSearch;
