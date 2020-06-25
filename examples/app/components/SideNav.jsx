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
    const sections = this.getSectionsFromUrl(props.pathname);
    this.state = {openSections: sections.currentSection ? [sections.currentSection] : []};
  }

  toggleSection(section) {
    const slug = strip(section).toLowerCase();
    const openSections = this.state.openSections;
    const index = openSections.indexOf(slug);
    if (index >= 0) openSections.splice(index, 1);
    else openSections.push(slug);
    this.setState({openSections});
  }

  getSectionsFromUrl(pathname) {
    const parts = pathname.includes("docs/") ? pathname.split("/") : false;
    const currentSection = parts ? parts[1] : false;
    const currentPage = parts ? parts[2] : false;
    return {currentPage, currentSection};
  }

  render() {
    const {openSections} = this.state;
    const {pathname} = this.props;

    const path = typeof window !== "undefined"
      ? window.location.pathname.substr(1)
      : pathname;

    const sections = this.getSectionsFromUrl(path);

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
                active={openSections.includes(strip(title).toLowerCase())}
              >
                {title}
              </Button>
              <Collapse isOpen={openSections.includes(strip(title).toLowerCase())}>
                {
                  pages.map((page, ii) =>
                    <AnchorButton key={ii}
                      active={sections.currentSection === strip(title).toLowerCase() && sections.currentPage === strip(page.title).toLowerCase()}
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
