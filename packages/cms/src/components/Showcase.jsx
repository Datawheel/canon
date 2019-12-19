import React, {Component, Fragment} from "react";
import {hot} from "react-hot-loader/root";

import {AnchorLink} from "@datawheel/canon-core";

import toKebabCase from "../utils/formatters/toKebabCase";
import styles from "style.yml";

import Button from "./fields/Button";
import ButtonGroup from "./fields/ButtonGroup";
import FilterSearch from "./fields/FilterSearch";

import "./Showcase.css";

class Showcase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      namespace: "cms"
    };
  }

  render() {
    const {namespace} = this.state;

    const components = [
      {
        name: "Fields",
        components: [
          {
            name: "Button",
            Component: Button,
            props: {
              children: "children as button text",
              icon: "tick",
              iconPosition: "left",
              onClick: () => alert("`onClick` triggered")
            }
          },
          {
            name: "ButtonGroup",
            Component: ButtonGroup,
            props: {
              buttons: [
                {
                  namespace,
                  active: namespace === "cms",
                  onClick: () => this.setState({namespace: "cms"}),
                  fontSize: "xs",
                  children: "cms"
                },
                {
                  namespace,
                  active: namespace === "cp",
                  onClick: () => this.setState({namespace: "cp"}),
                  fontSize: "xs",
                  children: "cp"
                }
              ]
            }
          },
          {
            name: "FilterSearch",
            Component: FilterSearch,
            props: {
              label: "Label is also placeholder text",
              onChange: () => console.log("`onChange` triggered"),
              onReset: e => e.target.value = ""
            }
          }
        ]
      }
    ];

    // console.log(this);

    return (
      <div className={`showcase ${namespace}`}>

        {/* header */}
        <header className="showcase-header">
          <h1 className="showcase-header-heading u-margin-top-off">All the components</h1>

          {console.log(FilterSearch)}

          {/* list of links */}
          <nav className="showcase-nav">
            {components.map(group =>
              <Fragment key={`${group.name}-nav-group`}>
                {/* group title */}
                <h2 className="u-font-xs display" key={`${group.name}-nav-title`}>
                  {group.name}
                </h2>
                {/* group components */}
                <ul className="showcase-nav-list">
                  {group.components.map(c =>
                    <li className="showcase-nav-item" key={`${c.name}-nav-nav`}>
                      <AnchorLink className="showcase-nav-link u-font-xs" to={toKebabCase(c.name)}>
                        {c.name}
                      </AnchorLink>
                    </li>
                  )}
                </ul>
              </Fragment>
            )}
          </nav>
        </header>

        {/* list of components */}
        <ul className="showcase-list">
          {components.map(group =>
            <Fragment key={`${group.name}-group`}>
              {/* group title */}
              <h2 className="u-font-md u-margin-top-xs" key={`${group.name}-title`}>
                {group.name}
              </h2>
              {/* group components */}
              <ul className="showcase-nested-list" key={`${group.name}-list`}>
                {group.components.map(c =>
                  <li className="showcase-item" id={toKebabCase(c.name)} key={c.name}>
                    <h3 className="heading u-font-xs u-margin-bottom-xs">{c.name}</h3>
                    <c.Component namespace={namespace} {...c.props} />
                  </li>
                )}
              </ul>
            </Fragment>
          )}
        </ul>
      </div>
    );
  }
}

export default hot(Showcase);
