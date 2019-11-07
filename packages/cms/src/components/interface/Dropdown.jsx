import React, {Component, Fragment} from "react";
import {hot} from "react-hot-loader/root";
import {Icon} from "@blueprintjs/core";
import "./Dropdown.css";

class Dropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
    this.toggleButton = React.createRef();
  }

  /** when tabbing out of the nav group, collapse it */
  onBlur(e) {
    const currentTarget = e.currentTarget;

    setTimeout(() => {
      if (!currentTarget.contains(document.activeElement)) {
        this.setState({isOpen: false});
      }
    }, 85); // register the click before closing
  }

  /** when clicking a subtitle, refocus the button to prevent the nav from losing focus and collapsing */
  onFocusButton() {
    setTimeout(() => {
      this.toggleButton.current.focus();
    }, 0);
  }

  /** the link markup is the same whether it's rendered in a nested list or not */
  renderLink(item) {
    const {namespace, onLinkClick} = this.props;
    return <a
      href={item.url || null}
      className={`${namespace}-dropdown-link`}
      onFocus={() => this.setState({isOpen: true})}
      onClick={onLinkClick ? item => onLinkClick(item) : null}
    >
      {item.icon &&
        <img className={`${namespace}-dropdown-link-icon`} src={`/images/icons/${item.icon}.png`} alt="" />
      }
      {item.title}
    </a>;
  }

  render() {
    const {
      className,
      namespace,  // cms (default)
      title,      // clickable title
      items       // list of items to render; can contain a nested object with items
    } = this.props;
    const {isOpen} = this.state;

    return (
      <li className={`${namespace}-dropdown${className ? ` ${className}` : ""}`} onBlur={e => this.onBlur(e)} onClick={() => this.onFocusButton()} key={`${title}-dropdown`}>
        {/* click the title to toggle the menu */}
        <button
          className={`${namespace}-dropdown-button display ${isOpen ? "is-active" : "is-inactive"}`}
          onClick={() => this.setState({isOpen: !isOpen})}
          ref={this.toggleButton}
        >
          <span className="u-visually-hidden">{isOpen ? "hide" : "show"} </span>
          <span className={`${namespace}-dropdown-button-text`}>{title} </span>
          <Icon icon="caret-down" className={`${namespace}-dropdown-button-icon`} />
        </button>

        {/* loop through nav links */}
        {items && items.length &&
          <ul className={`${namespace}-dropdown-list ${isOpen ? "is-open" : "is-closed"}`} key={`${title}-dropdown-list`}>
            {items.map(item =>
              <li className={`${namespace}-dropdown-item`} key={`${item.title}-dropdown-item`}>
                {item.items && item.items.length
                  // nested items array; render them in a nested list
                  ? <Fragment>
                    <p className={`${namespace}-dropdown-subtitle display`}>{item.title}</p>
                    <ul className={`${namespace}-dropdown-list ${namespace}-dropdown-nested-list`}>
                      {item.items.map(nestedItem =>
                        <li className={`${namespace}-dropdown-item ${namespace}-dropdown-nested-item`} key={`${item.title}-${nestedItem.title}-dropdown-nested-item`}>
                          {this.renderLink(nestedItem)}
                        </li>
                      )}
                    </ul>
                  </Fragment>

                  // no nested items array; just render the link
                  : this.renderLink(item)
                }
              </li>
            )}
          </ul>
        }
      </li>
    );
  }
}

Dropdown.defaultProps = {
  namespace: "cms"
};

export default hot(Dropdown);
