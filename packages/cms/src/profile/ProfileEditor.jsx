import axios from "axios";
import React, {Component} from "react";
import PropTypes from "prop-types";
import Loading from "components/Loading";
import Section from "../components/Section";

import TextCard from "../components/cards/TextCard";

import "./ProfileEditor.css";

class ProfileEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null,
      variables: null
    };
  }

  componentDidMount() {
    this.hitDB.bind(this)();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.hitDB.bind(this)(false);
    }
    const prevSlugs = prevProps.previews.map(d => d.slug).join();
    const prevIDs = prevProps.previews.map(d => d.id).join();
    const newSlugs = this.props.previews.map(d => d.slug).join();
    const newIDs = this.props.previews.map(d => d.id).join();
    if (prevSlugs !== newSlugs || prevIDs !== newIDs) {
      this.hitDB.bind(this)(true);
    }
  }

  hitDB() {
    axios.get(`/api/cms/profile/get/${this.props.id}`).then(resp => {
      this.setState({minData: resp.data});
    });
  }

  // Strip leading/trailing spaces and URL-breaking characters
  urlPrep(str) {
    return str.replace(/^\s+|\s+$/gm, "").replace(/[^a-zA-ZÀ-ž0-9-\ _]/g, "");
  }

  changeField(field, e) {
    const {minData} = this.state;
    minData[field] = field === "slug" ? this.urlPrep(e.target.value) : e.target.value;
    this.setState({minData});
  }

  render() {

    const {minData} = this.state;
    const {children, variables, locale, localeDefault} = this.props;

    const dataLoaded = minData;
    const varsLoaded = variables;
    const defLoaded = locale || variables && !locale && variables[localeDefault];
    const locLoaded = !locale || variables && locale && variables[localeDefault] && variables[locale];

    if (!dataLoaded || !varsLoaded || !defLoaded || !locLoaded) return <Loading />;

    return (
      <div className="cms-editor-inner">

        {/* search profiles */}
        {children}

        {/* profile meta */}
        {/* TODO: move to header */}
        <Section
          title="Profile meta"
          subtitle="Profile title"
          entity="splash"
          wrapperClassName="cms-splash-wrapper"
          cards={
            <TextCard
              locale={locale}
              localeDefault={localeDefault}
              item={minData}
              fields={["title", "subtitle"]}
              type="profile"
              variables={variables[localeDefault]}
            />
          }
        />
      </div>
    );
  }
}

ProfileEditor.contextTypes = {
  formatters: PropTypes.object
};

export default ProfileEditor;
