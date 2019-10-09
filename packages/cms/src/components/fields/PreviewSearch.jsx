import React, {Component} from "react";
import axios from "axios";
import PropTypes from "prop-types";
import {Icon} from "@blueprintjs/core";
import {event, select} from "d3-selection";
import {uuid} from "d3plus-common";
import "./PreviewSearch.css";

class PreviewSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      id: uuid(),
      results: [],
      userQuery: ""
    };
  }

  onChange(e) {
    const userQuery = e ? e.target.value : "";
    const {searchEmpty, url} = this.props;

    if (!searchEmpty && userQuery.length === 0) {
      this.setState({active: true, results: [], userQuery});
    }
    else if (url) {
      const {dimension, limit, levels} = this.props;
      let fullUrl = `${url}?q=${userQuery}&limit=${limit}`;
      if (dimension) fullUrl += `&dimension=${dimension}`;
      if (levels) fullUrl += `&levels=${levels.join()}`;
      this.setState({userQuery});
      axios.get(fullUrl)
        .then(res => res.data)
        .then(data => {
          let results = data.results;
          if (limit) results = results.slice(0, limit);
          this.setState({active: true, results});
        });
    }
  }

  onFocus() {
    this.setState({active: true});
  }

  onSelect(result) {
    setTimeout(() => {
      this.input.blur();
      this.setState({active: false, userQuery: result.name});
    }, 10);
  }

  onToggle() {
    if (this.state.active) {
      this.input.blur();
      this.setState({active: false});
    }
    else this.input.focus();
  }

  componentDidMount() {
    const {primary, searchEmpty} = this.props;
    const {id} = this.state;

    select(document).on(`mousedown.${id}`, () => {
      if (this.state.active && this.container && !this.container.contains(event.target)) {
        this.setState({active: false});
      }
    });

    select(document).on(`keydown.${id}`, () => {
      const {router} = this.context;
      const {active, results} = this.state;
      const key = event.keyCode;

      const DOWN = 40,
            ENTER = 13,
            ESC = 27,
            S = 83,
            UP = 38;

      if (primary && !active && key === S && !["input", "textarea"].includes(event.target.tagName.toLowerCase()) && !event.target.className.includes("ql-editor")) {
        event.preventDefault();
        this.onToggle.bind(this)();
      }
      else if (active && key === ESC && event.target === this.input) {
        event.preventDefault();
        this.onToggle.bind(this)();
      }
      else if (active && event.target === this.input) {

        const highlighted = document.querySelector(".is-highlighted");
        const listItems = document.querySelectorAll(".cms-search-result-item");
        const currentIndex = [].indexOf.call(listItems, highlighted);
        const d = results[currentIndex];

        if (key === ENTER && highlighted) {
          this.input.blur();
          this.setState({active: false, userQuery: d.name});
          const anchor = highlighted.querySelector("a");
          if (anchor) router.push(anchor.href);
        }
        else if (key === DOWN || key === UP) {
          if (!highlighted) {
            if (key === DOWN) document.querySelector(".cms-search-result-item:first-child").classList.add("is-highlighted");
          }

          else {
            if (key === DOWN && currentIndex < listItems.length - 1) {
              listItems[currentIndex + 1].classList.add("is-highlighted");
              highlighted.classList.remove("is-highlighted");
            }
            else if (key === UP) {
              if (currentIndex > 0) listItems[currentIndex - 1].classList.add("is-highlighted");
              highlighted.classList.remove("is-highlighted");
            }
          }
        }
      }
    }, false);

    if (searchEmpty) this.onChange.bind(this)();
  }

  render() {
    const {
      fontSize,
      label,
      previewing,
      renderResults,
      searchEmpty
    } = this.props;

    const {active, results, userQuery} = this.state;

    const showResults = searchEmpty || active && userQuery.length;

    return (
      <div
        className={`cms-preview-search u-font-${fontSize} ${previewing ? "is-value" : "is-placeholder"}`}
        ref={comp => this.container = comp}
      >
        <label className="u-visually-hidden cms-preview-search-text" htmlFor={`${label}-search-label`}>{label}</label>
        <input
          id={`${label}-search-label`}
          key="input-bar"
          className="cms-preview-search-input"
          placeholder={label}
          value={userQuery}
          onChange={this.onChange.bind(this)}
          onFocus={this.onFocus.bind(this)}
          ref={input => this.input = input}
        />

        {/* search icon */}
        <Icon className="cms-preview-search-icon" icon="search" />

        {showResults
          ? <ul className={`cms-search-result-list ${active ? "is-visible" : "is-hidden"}`}>
            {results.map(result =>
              <li
                className="cms-search-result-item u-font-xs"
                onClick={this.onSelect.bind(this, result)}
                key={result.id}
              >
                {renderResults(result, this.props)}
              </li>
            )}
            {!results.length &&
              <li className="cms-search-error-message u-font-xs">No results found</li>
            }
          </ul> : null
        }

        {/* close button */}
        {/*  <button className="cms-preview-search-close-button" tabIndex={ value && value.length ? 0 : -1 } onClick={onReset}>
          <span className="u-visually-hidden">reset search</span>
          <Icon className="cms-preview-search-close-button-icon" icon="cross" />
        </button>*/}
      </div>
    );
  }
}

PreviewSearch.contextTypes = {
  router: PropTypes.object
};

PreviewSearch.defaultProps = {
  fontSize: "md",
  buttonLink: false,
  buttonText: "Search",
  className: "search",
  dimension: false,
  icon: "search",
  inactiveComponent: false,
  inline: false,
  limit: 10,
  placeholder: "Search",
  primary: false,
  renderResults: d => d.name,
  searchEmpty: false,
  url: "/api/search"
};

export default PreviewSearch;
