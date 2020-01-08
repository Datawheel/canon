import React, {Component} from "react";
import PropTypes from "prop-types";
import {Link} from "react-router";
import axios from "axios";
import "./ProfileSearch.css";
import linkify from "../../utils/linkify";
import profileTitleFormat from "../../utils/profileTitleFormat";
import ProfileSearchTile from "./ProfileSearchTile";
import {Icon, NonIdealState, Spinner} from "@blueprintjs/core";
import {uuid} from "d3plus-common";
import {titleCase} from "d3plus-text";
import {event, select} from "d3-selection";
import styles from "style.yml";

/** Creates column titles */
function columnTitle(data) {
  return data[0].map(d => {
    let slug = d.slug;
    const dim = d.memberDimension;
    if (data[0].length === 1 && dim.toLowerCase() !== slug.toLowerCase()) {
      if (slug.match(/[A-z]{1,}/g).join("").length < 4) {
        slug = slug.toUpperCase();
      }
      else slug = titleCase(slug);
      return `${dim} (${slug})`;
    }
    return dim;
  }).join("/");
}

function isDescendant(parent, child) {
  let node = child.parentNode;
  while (node !== null) {
    if (node === parent) return true;
    node = node.parentNode;
  }
  return false;
}

function findSibling(elem, dir = "next") {

  let node = elem.parentNode;
  while (node.tagName.toLowerCase() !== "li") node = node.parentNode;

  let sibling = node[`${dir}Sibling`];

  if (!sibling) {
    const list = node.parentNode.parentNode;
    if (list.tagName.toLowerCase() === "li") {
      const column = list[`${dir}Sibling`];
      const items = select(column).selectAll("li")
      sibling = dir === "next" ? select(column).select("li").node()
        : items.nodes()[items.size() - 1];
    }
  }

  return sibling ? select(sibling).select("a").node() : sibling;
}

function findNeighbor(elem, dir = "next") {

  let node = elem.parentNode;
  while (node.tagName.toLowerCase() !== "li") node = node.parentNode;
  const nodeBounds = node.getBoundingClientRect();
  const columnX = nodeBounds.left;
  const nodeY = nodeBounds.top
  const list = node.parentNode.parentNode;
  let nextColumns = Array.from(select(list).selectAll("li").nodes())
    .filter(d => dir === "next" ? d.getBoundingClientRect().left > columnX : d.getBoundingClientRect().left < columnX);
  if (dir === "previous") nextColumns = nextColumns.reverse();
  let sibling = nextColumns.find((d, i) => d.getBoundingClientRect().top === nodeY || i === nextColumns.length - 1);

  if (!sibling) {
    const column = list[`${dir}Sibling`];
    nextColumns = Array.from(select(column).selectAll("li").nodes())
      .filter(d => dir === "next" ? d.getBoundingClientRect().left > columnX : d.getBoundingClientRect().left < columnX);
    if (dir === "previous") nextColumns = nextColumns.reverse();
    sibling = nextColumns.find((d, i) => d.getBoundingClientRect().top === nodeY);
    if (!sibling && nextColumns.length) sibling = nextColumns[dir === "previous" ? 0 : nextColumns.length - 1];
  }

  return sibling ? select(sibling).select("a").node() : sibling;
}

class ProfileSearch extends Component {

  constructor(props) {
    super(props);
    this.state = {
      id: uuid(),
      loading: false,
      query: "",
      results: false,
      timeout: 0
    };
  }

  componentDidMount() {

    const {id} = this.state;

    select(document).on(`keydown.${id}`, () => {

      const {router} = this.context;
      const {activeKey, display} = this.props;
      const activeKeyCode = activeKey !== false
        ? typeof activeKey === "string" && activeKey.length === 1
          ? activeKey.toUpperCase().charCodeAt(0)
          : activeKey
        : false;

      const key = event.keyCode;
      const DOWN = 40,
            ENTER = 13,
            ESC = 27,
            LEFT = 37,
            UP = 38,
            RIGHT = 39;

      const arrowKeys = display === "columns" ? [LEFT, UP, RIGHT, DOWN] : [UP, DOWN];
      const linkHighlighted = isDescendant(this.resultContainer, event.target);
      const tagName = event.target.tagName.toLowerCase();

      if (activeKeyCode !== false && key === activeKeyCode && !["input", "textarea"].includes(tagName)) {
        event.preventDefault();
        this.textInput.focus();
      }
      else if (key === ESC && event.target === this.textInput) {
        event.preventDefault();
        this.textInput.blur();
      }
      else if (key === DOWN && event.target === this.textInput) {
        event.preventDefault();
        const firstLink = select(this.resultContainer).select("a");
        if (firstLink.size()) firstLink.node().focus();
      }
      else if (arrowKeys.includes(key) && linkHighlighted) {

        event.preventDefault();

        if (key === DOWN) {
          const nextLink = findSibling(event.target, "next");
          if (nextLink) this.scrollToLink.bind(this)(nextLink);
        }
        else if (key === UP) {
          const previousLink = findSibling(event.target, "previous");
          if (previousLink) this.scrollToLink.bind(this)(previousLink);
          else this.textInput.focus();
        }
        else if (key === RIGHT) {
          const nextLink = findNeighbor(event.target, "next");
          if (nextLink) this.scrollToLink.bind(this)(nextLink);
        }
        else if (key === LEFT) {
          const previousLink = findNeighbor(event.target, "previous");
          if (previousLink) this.scrollToLink.bind(this)(previousLink);
        }

      }
      else if (key === ENTER && linkHighlighted) {
        const url = event.target.getAttribute("href");
        if (url) router.push(url);
      }

    }, false);

  }

  scrollToLink(elem) {
    const {display} = this.props;
    const topOffset = display === "columns" ? parseFloat(styles["nav-height"], 10) : 0;
    elem.scrollIntoView({block: "nearest"});
    const top = elem.getBoundingClientRect().top - this.resultContainer.getBoundingClientRect().top;
    if (topOffset && top < topOffset) this.resultContainer.scrollTop -= (topOffset - top);
    elem.focus();
  }

  onChange(e) {

    const {timeout} = this.state;
    const {limit, minQueryLength} = this.props;
    const query = e ? e.target.value : this.state.query;
    clearTimeout(timeout);

    if (query.length < minQueryLength) {
      this.setState({results: false, query});
    }
    else {

      const url = `/api/profilesearch?query=${query}&limit=${limit}`;

      // handle the query
      this.setState({
        loading: url,
        // set query separately to avoid input lag
        query,
        results: false,
        // make the request on a timeout
        timeout: setTimeout(() => {

          axios.get(url)
            .then(resp => {
              if (url === this.state.loading) this.setState({results: resp.data, loading: false});
            })
            .catch(() => {});

        }, 500)
      });
    }
  }

  resetSearch(e) {
    this.setState({
      query: "",
      results: false
    });
  }

  render() {

    const {router} = this.context;
    const {loading, query, results} = this.state;
    const {display, inputFontSize, joiner, limit} = this.props;

    console.log(results);

    return (
      <div className="cms-profilesearch">

        <label key="input" className={`cp-input-label inputFontSize-${inputFontSize}`}>
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

        <div className="cms-profilesearch-container" key="container" ref={comp => this.resultContainer = comp}>
          {
            results
            ? (() => {

              if (!results.grouped.length) {
                return <NonIdealState key="empty" icon="zoom-out" title={`No results matching "${query}"`} />;
              }

              switch(display) {

                case "columns":
                  return (
                    <ul key="columns" className="cms-profilesearch-columns">
                      {Object.keys((results.profiles || {})).map((profile, i) => {
                        const data = (results.profiles[profile] || []).slice(0, limit);
                        return (
                          <li key={`p-${i}`} className="cms-profilesearch-column">
                            <h3 className="cms-profilesearch-column-title">{columnTitle(data)}</h3>
                            <ul className="cms-profilesearch-column-list">
                              {data.map((result, j) =>
                                <ProfileSearchTile key={`r-${j}`} {...this.props} data={result} />)}
                            </ul>
                          </li>
                        );
                      })}
                    </ul>
                  );

                case "list":
                  return (
                    <ul key="list" className="cms-profilesearch-list">
                      {(results.grouped || []).slice(0, limit).map((result, j) =>
                        <li key={`r-${j}`} className="cms-profilesearch-list-item">
                          <Link to={linkify(router, result)} className="cms-profilesearch-list-item-link">
                            {result.map(d => profileTitleFormat(d.name)).join(` ${joiner} `)}
                            <div className="cms-profilesearch-list-item-sub u-font-xs">{columnTitle([result])}</div>
                          </Link>
                        </li>
                      )}
                    </ul>
                  );

              }

            })()
            : loading
            ? <NonIdealState key="loading" icon={<Spinner />} title="Loading results..." />
            : <NonIdealState key="start" icon="search" title="Please enter a search term" />
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
  activateKey: false,
  display: "list",
  inputFontSize: "xxl",
  joiner: "&",
  limit: 10,
  minQueryLength: 1
};

export default ProfileSearch;
