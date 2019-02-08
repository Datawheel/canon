import React, {Component} from "react";
import PropTypes from "prop-types";
import {Popover} from "@blueprintjs/core";

import axios from "axios";

import {event, select} from "d3-selection";
import {uuid} from "d3plus-common";
import "./Search.css";

class Search extends Component {

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
      const {dimension, limit} = this.props;
      let fullUrl = `${url}?q=${userQuery}&limit=${limit}`;
      if (dimension) fullUrl += `&dimension=${dimension}`;
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
    this.input.blur();
    this.setState({active: false, userQuery: result.name});
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

        const highlighted = document.querySelector(".highlighted");
        const listItems = document.querySelectorAll(".results > li");
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
            if (key === DOWN) document.querySelector(".results > li:first-child").classList.add("highlighted");
          }
          else {

            if (key === DOWN && currentIndex < listItems.length - 1) {
              listItems[currentIndex + 1].classList.add("highlighted");
              highlighted.classList.remove("highlighted");
            }
            else if (key === UP) {
              if (currentIndex > 0) listItems[currentIndex - 1].classList.add("highlighted");
              highlighted.classList.remove("highlighted");
            }
          }
        }

      }

    }, false);

    if (searchEmpty) this.onChange.bind(this)();

  }

  render() {

    const {
      buttonLink,
      buttonText,
      className,
      icon,
      inactiveComponent: InactiveComponent,
      placeholder,
      render,
      searchEmpty
    } = this.props;
    const {active, results, userQuery} = this.state;

    const show = searchEmpty || active && userQuery.length;

    return (
      <div ref={comp => this.container = comp} className={`cms-search bp3-control-group canon-search ${className} ${active ? "active" : ""}`}>
        {InactiveComponent && <InactiveComponent active={active} onClick={this.onToggle.bind(this)} />}
        <Popover minimal={true} usePortal={false} autoFocus={false} isOpen={show}>
          <div className={`bp3-input-group bp3-fill ${active ? "active" : ""}`}>
            {icon && <span className="bp3-icon bp3-icon-search"></span>}
            <input type="text" className="bp3-input" ref={input => this.input = input} onChange={this.onChange.bind(this)} onFocus={this.onFocus.bind(this)} placeholder={placeholder} value={userQuery} />
            {buttonLink && <a href={`${buttonLink}?q=${userQuery}`} className="bp3-button">{buttonText}</a>}
          </div>
          <ul className={active ? "results active" : "results"}>
            {results.map(result =>
              <li key={result.id} className="result" onClick={this.onSelect.bind(this, result)}>
                <span className="result-link" role="link">
                  {render(result, this.props)}
                </span>
              </li>
            )}
            {!results.length && <li className="no-results">No Results Found</li>}
            {results.length && buttonLink ? <a className="all-results bp3-button bp3-fill" href={`${buttonLink}?q=${userQuery}`}>Show All Results</a> : null}
          </ul>
        </Popover>
      </div>
    );

  }
}

Search.contextTypes = {
  router: PropTypes.object
};

Search.defaultProps = {
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
  render: d => <span>{d.name}</span>,
  searchEmpty: false,
  url: "/api/search"
};

export default Search;
