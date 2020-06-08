import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {Link} from "react-router";
import axios from "axios";
import "./ProfileSearch.css";
import linkify from "../../utils/linkify";
import {formatTitle} from "../../utils/profileTitleFormat";
import {Icon, NonIdealState, Spinner} from "@blueprintjs/core";
import {uuid} from "d3plus-common";
import {event, select} from "d3-selection";
import styles from "style.yml";
import ProfileColumns from "./ProfileColumns";

/** used for up/down arrow movement */
function findSibling(elem, dir = "next") {

  let node = elem.parentNode;
  while (node.tagName.toLowerCase() !== "li") node = node.parentNode;

  let sibling = node[`${dir}Sibling`];

  if (!sibling) {
    const list = node.parentNode.parentNode;
    if (list.tagName.toLowerCase() === "li") {
      const column = list[`${dir}Sibling`];
      const items = select(column).selectAll("li");
      sibling = dir === "next" ? select(column).select("li").node()
        : items.nodes()[items.size() - 1];
    }
  }

  return sibling ? select(sibling).select("a").node() : sibling;
}

/** used for left/right arrow movement */
function findNeighbor(elem, dir = "next") {

  let node = elem.parentNode;
  while (node.tagName.toLowerCase() !== "li") node = node.parentNode;
  const nodeBounds = node.getBoundingClientRect();
  const columnX = nodeBounds.left;
  const nodeY = nodeBounds.top;
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
    sibling = nextColumns.find(d => d.getBoundingClientRect().top === nodeY);
    if (!sibling && nextColumns.length) sibling = nextColumns[dir === "previous" ? 0 : nextColumns.length - 1];
  }

  return sibling ? select(sibling).select("a").node() : sibling;
}

class ProfileSearch extends Component {

  constructor(props) {
    super(props);
    this.state = {
      active: false,
      id: uuid(),
      loading: false,
      query: "",
      results: false,
      timeout: 0
    };
  }

  componentDidMount() {

    const {id} = this.state;
    const {showExamples} = this.props;

    if (showExamples) {
      this.onChange.bind(this)();
    }

    select(document).on(`mousedown.${id}`, () => {
      const {active} = this.state;
      const {position} = this.props;
      const container = this.resultContainer;
      if (position === "absolute" && active && container && !container.contains(event.target)) {
        this.onToggle.bind(this)();
      }
    });

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
            RIGHT = 39,
            UP = 38;

      const arrowKeys = display === "columns" ? [LEFT, UP, RIGHT, DOWN] : [UP, DOWN];
      const linkHighlighted = this.resultContainer && this.resultContainer.contains(event.target);
      const tagName = event.target.tagName.toLowerCase();

      if (activeKeyCode !== false && key === activeKeyCode && !["input", "textarea"].includes(tagName)) {
        event.preventDefault();
        this.onToggle.bind(this)();
      }
      else if (key === ESC && event.target === this.textInput) {
        event.preventDefault();
        this.onToggle.bind(this)();
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
    if (topOffset && top < topOffset) this.resultContainer.scrollTop -= topOffset - top;
    elem.focus();
  }

  onChange(e) {

    const {timeout} = this.state;
    const {limit, minQueryLength, showExamples, formatResults} = this.props;

    let query = e ? e.target.value : this.state.query;
    if (query.length < minQueryLength) query = "";

    clearTimeout(timeout);

    if (!showExamples && !query.length) {
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
              if (url === this.state.loading) {
                resp = formatResults(resp);
                this.setState({results: resp.data, loading: false});
              }
            })
            .catch(() => {});

        }, 1000)
      });
    }
  }

  resetSearch() {
    this.setState({
      query: "",
      results: false
    });
  }

  onFocus() {
    this.setState({active: true});
  }

  onToggle() {

    const {active} = this.state;
    this.textInput[active ? "blur" : "focus"]();
    this.setState({active: !active});

  }

  render() {

    const {router} = this.context;
    const {active, loading, query, results} = this.state;
    const {locale, placeholder} = this.props;
    const {
      availableProfiles,
      columnTitles,
      display,
      columnOrder,
      inputFontSize,
      joiner,
      position,
      subtitleFormat
    } = this.props;

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
            placeholder={placeholder}
            value={query}
            onChange={this.onChange.bind(this)}
            onFocus={this.onFocus.bind(this)}
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

        <div className={`cms-profilesearch-container cms-profilesearch-container-${position}`} key="container" ref={comp => this.resultContainer = comp}>
          {
            (position !== "absolute" || active) && results
              ? (() => {

                if (!results.grouped.length) {
                  return <NonIdealState key="empty" icon="zoom-out" title={`No results matching "${query}"`} />;
                }

                else {
                  switch (display) {

                    case "columns":
                      const filteredProfiles = Object.keys(results.profiles || {})
                        .reduce((obj, d) => {
                          let arr = results.profiles[d];
                          if (availableProfiles.length) arr = arr.filter(p => availableProfiles.includes(p[0].slug));
                          if (arr.length) obj[d] = arr;
                          return obj;
                        }, {});
                      const columnProfiles = Object.keys(filteredProfiles || {})
                        .sort((a, b) => {
                          const aIndex = columnOrder.includes(a) ? columnOrder.indexOf(a) : columnOrder.length + 1;
                          const bIndex = columnOrder.includes(b) ? columnOrder.indexOf(b) : columnOrder.length + 1;
                          return aIndex - bIndex;
                        })
                        .map(profile => results.profiles[profile] || []);
                      return <ProfileColumns columnFormat={subtitleFormat} columnTitles={columnTitles} joiner={joiner} tileProps={{joiner, subtitleFormat}} data={columnProfiles} />;

                    default:
                      const listProfiles = (results.grouped || [])
                        .filter(d => !availableProfiles.length || availableProfiles.includes(d[0].slug));
                      return (
                        <ul key="list" className="cms-profilesearch-list">
                          {listProfiles.map((result, j) =>
                            <li key={`r-${j}`} className="cms-profilesearch-list-item">
                              <Link to={linkify(router, result, locale)} className="cms-profilesearch-list-item-link">
                                {result.map(d => formatTitle(d.name)).join(joiner)}
                                <div className="cms-profilesearch-list-item-sub u-font-xs">{result.map(subtitleFormat).join(joiner)}</div>
                              </Link>
                            </li>
                          )}
                        </ul>
                      );
                  }

                }

              })()
              : loading && (position !== "absolute" || active)
                ? <NonIdealState key="loading" icon={<Spinner />} title="Loading results..." />
                : position !== "absolute" ? <NonIdealState key="start" icon="search" title="Please enter a search term" /> : null
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
  availableProfiles: [],
  columnOrder: [],
  columnTitles: {},
  display: "list",
  inputFontSize: "xxl",
  joiner: " & ",
  limit: 10,
  minQueryLength: 1,
  placeholder: "Search...",
  position: "static",
  showExamples: false,
  subtitleFormat: d => d.memberHierarchy,
  formatResults: resp => resp
};

export default connect(state => ({
  locale: state.i18n.locale
}))(ProfileSearch);
