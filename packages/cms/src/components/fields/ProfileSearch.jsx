import React, {Component} from "react";
import axios from "axios";
import "./ProfileSearch.css";
import {Icon} from "@blueprintjs/core";

class ProfileSearch extends Component {

  constructor(props) {
    super(props);
    this.state = {
      query: "",
      results: false
    };
  }

  search() {
    const {query} = this.state;

    if (query) {
      axios.get(`/api/deepsearch?query=${query}`)
        .then(resp => {
          this.setState({results: resp.data});
        });
    }
    else {
      this.setState({results: false});
    }
  }

  keyPress(e) {
    if (e.keyCode === 13) this.search.bind(this)();
  }

  linkify(result) {
    const link = result.reduce((acc, d) => acc.concat(`/${d.slug}/${d.memberSlug}`), "/profile");
    const name = result.map(d => d.name).join("/");
    return <a href={link}>{`${name} (${result[0].avg || result[0].ranking})`}</a>;
  }

  resetSearch() {
    this.setState({
      query: "",
      results: false
    });
  }

  render() {

    const {query, results} = this.state;

    const {display, inputFontSize} = this.props;

    const inline = true;
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
            // onChange={this.onChange.bind(this) }
            onChange={e => this.setState({query: e.target.value})}
            onKeyDown={this.keyPress.bind(this)}
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

        <button onClick={this.search.bind(this)} >SEARCH</button>
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
                            <li key={`r-${j}`}>{this.linkify(result)}</li>
                          )}
                        </ul>
                      </div>
                    )}</React.Fragment>
                  );

                default:
                  return (
                    <ul className="cms-profilesearch-list">
                      {(results.grouped || []).map((result, i) => <li key={`r-${i}`}>{this.linkify(result)}</li>)}
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

ProfileSearch.defaultProps = {
  display: "list",
  inputFontSize: "xxl"
};

export default ProfileSearch;
