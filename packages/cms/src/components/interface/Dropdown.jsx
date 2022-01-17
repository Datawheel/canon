import React, {Component, Fragment} from "react";
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
    const {namespace} = this.props;
    let El = "a";
    if (item.onClick) El = "button";

    return <El
      className={`${namespace}-dropdown-link${item.selected ? " is-selected" : ""}`}
      href={item.url}
      onClick={() => {
        item.onClick();
        this.setState({isOpen: false});
      }}
      onFocus={() => this.setState({isOpen: true})}
    >
      {item.title}
      {item.icon &&
        <Icon className={`${namespace}-dropdown-link-icon`} icon={item.icon} />
      }
    </El>;
  }

  render() {
    const {
      className,  // bring your own className
      namespace,  // cms (default)
      title,      // clickable title
      items,      // list of items to render; can contain a nested object with items
      selected    // whether or not the parent is slected
    } = this.props;
    const {isOpen} = this.state;

    return (
      <li
        className={`${namespace}-dropdown${className ? ` ${className}` : ""}`}
        onBlur={e => this.onBlur(e)}
        onClick={() => this.onFocusButton()}
        key={`${title}-dropdown`}
      >
        {/* click the title to toggle the menu */}
        <button
          className={`${namespace}-dropdown-button ${isOpen ? "is-active" : "is-inactive"}${selected ? " is-selected" : ""}`}
          onClick={() => this.setState({isOpen: !isOpen})}
          ref={this.toggleButton}
          key={`${title}-dropdown-button`}
        >
          <span className="u-visually-hidden">{isOpen ? "hide" : "show"} </span>
          <span className={`${namespace}-dropdown-button-text`}>{title} </span>
          <Icon icon="caret-down" className={`${namespace}-dropdown-button-icon`} />
        </button>

        {/* loop through nav links */}
        {items && items.length &&
          <ul className={`${namespace}-dropdown-list ${isOpen ? "is-open" : "is-closed"}`} key={`${title}-dropdown-list`}>
            {items.map((item, i) =>
              <li className={`${namespace}-dropdown-item`} key={`${item.title}-${i}-dropdown-item`}>
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

export default Dropdown;
