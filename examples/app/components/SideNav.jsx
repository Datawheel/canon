import React, {Component, Fragment} from "react";
import PropTypes from "prop-types";
import {hot} from "react-hot-loader/root";
import {Alignment, Button, Collapse, AnchorButton} from "@blueprintjs/core";
import {PACKAGES} from "$app/pages/Docs";
import {strip} from "d3plus-text";

import "./SideNav.css";

class SideNav extends Component {

  constructor(props) {
    super(props);
    this.state = {openSections: []};
  }

  toggleSection(section) {
    const openSections = this.state.openSections.slice();
    const index = openSections.indexOf(section);
    if (index >= 0) openSections.splice(index, 1);
    else openSections.push(section);
    this.setState({openSections});
  }

  render() {
    const {openSections} = this.state;

    const path = typeof window !== "undefined"
      ? window.location.pathname
      : "";

    const currentPage = path.includes("/docs/") ? path.split("/").slice(-1)[0] : false;

    return (
      <div id="SideNav">
        {
          PACKAGES.map(({icon, pages, title}, i) =>
            <Fragment key={i}>
              <Button
                fill={true}
                icon={icon}
                minimal={true}
                outlined={true}
                alignText={Alignment.LEFT}
                onClick={this.toggleSection.bind(this, title)}
                active={openSections.includes(title)}
              >
                {title}
              </Button>
              <Collapse isOpen={openSections.includes(title)}>
                {
                  pages.map((page, ii) =>
                    <AnchorButton key={ii}
                      active={currentPage === strip(page.title).toLowerCase()}
                      alignText={Alignment.LEFT}
                      fill={true}
                      minimal={true}
                      href={`/docs/${strip(title).toLowerCase()}/${strip(page.title).toLowerCase()}`}
                    >
                      {page.title}
                    </AnchorButton>
                  )
                }
              </Collapse>
            </Fragment>
          )
        }

      </div>
    );

  }
}

SideNav.contextTypes = {
  router: PropTypes.object
};

export default hot(SideNav);
