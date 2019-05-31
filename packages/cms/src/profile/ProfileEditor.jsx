import axios from "axios";
import React, {Component} from "react";
import PropTypes from "prop-types";
import Loading from "components/Loading";
import Section from "../components/Section";
import Status from "../components/Status";

import GeneratorCard from "../components/cards/GeneratorCard";
import TextCard from "../components/cards/TextCard";

import "./ProfileEditor.css";

const propMap = {
  generator: "generators",
  materializer: "materializers"
};

class ProfileEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null,
      variables: null,
      recompiling: true
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

  hitDB(force) {
    axios.get(`/api/cms/profile/get/${this.props.id}`).then(resp => {
      this.setState({minData: resp.data, recompiling: true}, this.fetchVariables.bind(this, force));
    });
  }

  fetchVariables(force) {
    if (this.props.fetchVariables) {
      this.props.fetchVariables(force, () => this.setState({recompiling: false}));
    }
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

  onSave() {
    this.setState({recompiling: true}, this.fetchVariables.bind(this, true));
  }

  onDelete(type, newArray) {
    const {minData} = this.state;
    minData[propMap[type]] = newArray;
    if (type === "generator" || type === "materializer") {
      this.setState({minData, recompiling: true}, this.fetchVariables.bind(this, true));
    }
    else {
      this.setState({minData});
    }
  }

  addItem(type) {
    const {minData} = this.state;
    const payload = {};
    payload.profile_id = minData.id;
    // todo: move this ordering out to axios (let the server concat it to the end)
    payload.ordering = minData[propMap[type]].length;
    axios.post(`/api/cms/${type}/new`, payload).then(resp => {
      if (resp.status === 200) {
        if (type === "generator" || type === "materializer") {
          minData[propMap[type]].push({id: resp.data.id, name: resp.data.name, ordering: resp.data.ordering || null});
          this.setState({minData}, this.fetchVariables.bind(this, true));
        }
        else {
          minData[propMap[type]].push({id: resp.data.id, ordering: resp.data.ordering});
          this.setState({minData});
        }
      }
    });
  }

  onMove() {
    this.forceUpdate();
  }

  render() {

    const {minData, recompiling} = this.state;
    const {children, variables, previews, locale, localeDefault} = this.props;

    const dataLoaded = minData;
    const varsLoaded = variables;
    const defLoaded = locale || variables && !locale && variables[localeDefault];
    const locLoaded = !locale || variables && locale && variables[localeDefault] && variables[locale];

    if (!dataLoaded || !varsLoaded || !defLoaded || !locLoaded) return <Loading />;

    return (
      <div className="cms-editor-inner">
        {/* loading status */}
        <Status recompiling={recompiling} />

        {/* search profiles */}
        {children}

        {/* generators */}
        <Section
          title="Generators"
          entity="generator"
          description="Variables constructed from JSON data calls."
          addItem={this.addItem.bind(this, "generator")}
          cards={minData.generators && minData.generators
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(g => <GeneratorCard
              key={g.id}
              context="generator"
              item={g}
              attr={minData.attr || {}}
              locale={localeDefault}
              secondaryLocale={locale}
              previews={previews}
              onSave={this.onSave.bind(this)}
              onDelete={this.onDelete.bind(this)}
              type="generator"
              variables={variables[localeDefault]}
              secondaryVariables={variables[locale]}
            />)}
        />

        {/* materializers */}
        <Section
          title="Materializers"
          entity="materializer"
          description="Variables constructed from other variables. No API calls needed."
          addItem={this.addItem.bind(this, "materializer")}
          cards={minData.materializers && minData.materializers
            .map(m => <GeneratorCard
              key={m.id}
              context="materializer"
              item={m}
              locale={localeDefault}
              secondaryLocale={locale}
              onSave={this.onSave.bind(this)}
              onDelete={this.onDelete.bind(this)}
              type="materializer"
              variables={variables[localeDefault]}
              secondaryVariables={variables[locale]}
              parentArray={minData.materializers}
              onMove={this.onMove.bind(this)}
            />)}
        />

        {/* profile meta */}
        <Section
          title="Profile meta"
          entity="splash"
          wrapperClassName="cms-splash-wrapper"
          cards={
            <TextCard
              locale={localeDefault}
              localeDefault={localeDefault}
              item={minData}
              fields={["title", "subtitle"]}
              type="profile"
              variables={variables[localeDefault]}
            />
          }
          secondaryCards={locale &&
            <TextCard
              locale={locale}
              localeDefault={localeDefault}
              item={minData}
              fields={["title", "subtitle"]}
              type="profile"
              variables={variables[locale]}
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
