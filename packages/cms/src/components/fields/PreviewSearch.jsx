import React, {Component} from "react";
import axios from "axios";
import {Icon} from "@blueprintjs/core";
import {connect} from "react-redux";
import {event, select} from "d3-selection";
import Button from "../fields/Button";
import {uuid} from "d3plus-common";
import {setStatus} from "../../actions/status";
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

  onSelectPreview(result) {
    const {url, meta, index} = this.props;
    const {id, name, slug: memberSlug} = result;
    // When selecting a new preview, a new roundtrip is required to fetch parents.
    const fullURL = `${url}?slug=${memberSlug}&limit=1&parents=true`;
    axios.get(fullURL).then(resp => {
      let searchObj = {};
      if (resp.data && resp.data.results) {
        searchObj = resp.data.results[0];
      }
      // meta is an array of possible variants. Use the clicked result to divine which one we're on.
      const newMeta = meta.find(m => m.dimension === searchObj.dimension && m.cubeName === searchObj.cubeName);
      const newPreview = {slug: newMeta.slug, id, name, memberSlug, searchObj};
      const previews = this.props.status.previews.map((p, i) => i === index ? newPreview : p);
      const pathObj = Object.assign({}, this.props.status.pathObj, {previews});
      this.props.setStatus({pathObj, previews, userQuery: ""});
    });
  }

  onChange(e) {
    const userQuery = e ? e.target.value : "";
    const {searchEmpty, url} = this.props;

    if (!searchEmpty && userQuery.length === 0) {
      this.setState({active: true, results: [], userQuery});
    }
    else if (url) {
      const {limit, meta} = this.props;
      const fullUrl = `${url}?q=${userQuery}&limit=${limit}&pslug=${meta.map(m => m.slug).join()}`;
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
      this.setState({active: false, userQuery: result.name});
    }, 10);
  }

  onToggle() {
    if (this.state.active) {
      this.setState({active: false, userQuery: ""});
      setTimeout(() => this.input.focus());
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
          this.setState({active: false, userQuery: d.name});
          const button = highlighted.querySelector("button");
          if (button) {
            this.onSelectPreview.bind(this)(d);
          }
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
      searchEmpty
    } = this.props;

    const {active, results, userQuery} = this.state;

    const showResults = searchEmpty || active && userQuery.length;

    return (
      <div
        className={`cms-preview-search u-font-${fontSize} ${previewing ? "is-value" : "is-placeholder"} ${active ? "is-active" : "is-inactive"}`}
        ref={comp => this.container = comp}
      >
        <label className="u-visually-hidden cms-preview-search-text" htmlFor={`${label}-search`}>
          {label}
        </label>
        <input
          id={`${label}-search`}
          name={`${label}-search`}
          key="input-bar"
          className="cms-preview-search-input"
          placeholder={label}
          value={userQuery}
          onChange={this.onChange.bind(this)}
          onFocus={this.onFocus.bind(this)}
          autoComplete="off"
          ref={input => this.input = input}
        />

        {/* search icon */}
        <Icon className="cms-preview-search-icon" icon="search" />

        {/* close button */}
        <button className="cms-preview-search-close-button" tabIndex={ userQuery && userQuery.length ? 0 : -1 } onClick={() => this.onToggle()}>
          <span className="u-visually-hidden">reset search</span>
          <Icon className="cms-preview-search-close-button-icon" icon="cross" />
        </button>

        {showResults
          ? <ul className={`cms-search-result-list ${active ? "is-visible" : "is-hidden"}`}>
            {results.map(result =>
              <li
                className="cms-search-result-item u-font-xs"
                onClick={this.onSelect.bind(this, result)}
                key={result.id}
                result={result}
              >
                <Button
                  className="cms-search-result-button"
                  namespace="cms"
                  fontSize="xxs"
                  onClick={this.onSelectPreview.bind(this, result)}
                >
                  {result.name}
                </Button>
              </li>
            )}
            {!results.length &&
              <li className="cms-search-error-message u-font-xxs">No results found</li>
            }
          </ul> : null
        }
      </div>
    );
  }
}

PreviewSearch.defaultProps = {
  fontSize: "md",
  buttonLink: false,
  buttonText: "Search",
  className: "search",
  icon: "search",
  inactiveComponent: false,
  inline: false,
  limit: 10,
  placeholder: "Search",
  primary: false,
  searchEmpty: false,
  url: "/api/search"
};

const mapStateToProps = state => ({
  status: state.cms.status
});

const mapDispatchToProps = dispatch => ({
  setStatus: status => dispatch(setStatus(status))
});

export default connect(mapStateToProps, mapDispatchToProps)(PreviewSearch);
