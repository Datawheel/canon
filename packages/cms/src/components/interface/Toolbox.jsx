import React, {Component} from "react";
import {connect} from "react-redux";
import Deck from "./Deck";

import Button from "../fields/Button";
import ButtonGroup from "../fields/ButtonGroup";
import FilterSearch from "../fields/FilterSearch";

import GeneratorCard from "../cards/GeneratorCard";
import SelectorCard from "../cards/SelectorCard";

import ConsoleVariable from "../variables/ConsoleVariable";

import {fetchVariables, newEntity} from "../../actions/profiles";
import {setStatus} from "../../actions/status";

import "./Toolbox.css";

class Toolbox extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentView: "generators",
      detailView: true,
      query: ""
    };
  }

  componentDidUpdate(prevProps) {
    const oldSlugs = prevProps.status.previews ? prevProps.status.previews.map(p => p.slug).join() : prevProps.status.previews;
    const newSlugs = this.props.status.previews ? this.props.status.previews.map(p => p.slug).join() : this.props.status.previews;
    const oldIDs = prevProps.status.previews ? prevProps.status.previews.map(p => p.id).join() : prevProps.status.previews;
    const newIDs = this.props.status.previews ? this.props.status.previews.map(p => p.id).join() : this.props.status.previews;
    const changedSinglePreview = oldSlugs === newSlugs && oldIDs !== newIDs;
    const changedEntireProfile = oldSlugs !== newSlugs;

    const localeChanged = prevProps.status.localeSecondary !== this.props.status.localeSecondary;

    if (changedSinglePreview) {
      this.props.fetchVariables({type: "generator", ids: this.props.profile.generators.map(g => g.id)});
    }
    // TODO: This preview-changing detection is a little janky. Change NavBar.jsx (and all cmsRoute Profile gets)
    // To always deliver profiles with previews already set, remove ResetPreviews, and just call FetchVariables immediately.
    if (changedEntireProfile) { 
      const prevSlugs = prevProps.status.previews ? prevProps.status.previews.map(p => p.slug) : [];
      const currSlugs = this.props.status.previews ? this.props.status.previews.map(p => p.slug) : [];
      const addedDimension = prevSlugs.length === 0 && currSlugs.length === 1;
      const deletedDimension = prevSlugs.length === 1 && currSlugs.length === 0;
      // This check is not perfect, and it fires when moving from profiles with 0 to 1 dimensions and vice versa.
      // However, the only side effect is not using the cache and re-running the generators.
      const sameProfileButChangedMeta = addedDimension || deletedDimension || prevSlugs.some(slug => currSlugs.includes(slug));
      const useCache = !sameProfileButChangedMeta;
      this.props.fetchVariables({type: "generator", ids: this.props.profile.generators.map(g => g.id)}, useCache);
    }
    if (localeChanged) {
      this.props.fetchVariables({type: "generator", ids: this.props.profile.generators.map(g => g.id)});
    }
    // Detect Deletions
    const {justDeleted} = this.props.status;
    if (JSON.stringify(prevProps.status.justDeleted) !== JSON.stringify(justDeleted)) {
      // Providing fetchvariables (and ultimately, /api/variables) with a now deleted generator or materializer id
      // is handled gracefully - it prunes the provided id from the variables object and re-runs necessary gens/mats.
      if (justDeleted.type === "generator") {
        this.props.fetchVariables({type: "generator", ids: [justDeleted.id]});  
      }
      else if (justDeleted.type === "materializer") {
        this.props.fetchVariables({type: "materializer", ids: [justDeleted.id]});
      }
    }
  }

  addItem(type) {
    this.props.newEntity(type, {profile_id: this.props.profile.id});
  }

  filter(e) {
    this.setState({query: e.target.value});
  }

  onReset() {
    this.setState({query: ""});
    setTimeout(
      document.querySelector(".cms-filter-search-input").focus()
    ), 0;
  }

  filterFunc(d) {
    const {query} = this.state;
    const {forceOpen, forceID, forceType} = this.props.status;
    const fields = ["name", "description", "title"];
    const matched = fields.map(f => d[f] !== undefined ? d[f].toLowerCase().includes(query) : false).some(d => d);
    const opened = d.type === forceType && d.id === forceID && forceOpen;
    return matched || opened;
  }

  openGenerator(key) {
    const {localeDefault} = this.props.status;
    const {variables} = this.props.status;
    const vars = variables[localeDefault];

    const gens = Object.keys(vars._genStatus);
    gens.forEach(id => {
      if (vars._genStatus[id][key]) {
        this.props.setStatus({forceID: Number(id), forceType: "generator", forceOpen: true});
      }
    });

    const mats = Object.keys(vars._matStatus);
    mats.forEach(id => {
      if (vars._matStatus[id][key]) {
        this.props.setStatus({forceID: Number(id), forceType: "materializer", forceOpen: true});
      }
    });
  }

  render() {
    const {detailView, query} = this.state;
    const {children, toolboxVisible} = this.props;
    const {profile} = this.props;
    const formattersAll = this.props.formatters;
    const {variables, localeDefault, localeSecondary, forceOpen, toolboxDialogOpen} = this.props.status;

    const dataLoaded = profile;

    if (!dataLoaded) return null;

    const varsLoaded = variables;
    const defLoaded = localeSecondary || variables && !localeSecondary && variables[localeDefault];
    const locLoaded = !localeSecondary || variables && localeSecondary && variables[localeDefault] && variables[localeSecondary];

    if (!varsLoaded || !defLoaded || !locLoaded) return <div className="cms-toolbox is-loading"><h3>Loading...</h3></div>;

    const attrGen = {
      id: "attributes",
      name: "Attributes",
      locked: true
    };

    let generators = profile.generators
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(d => Object.assign({}, {type: "generator"}, d))
      .filter(this.filterFunc.bind(this));

    if (this.props.status.profilesLoaded) generators = [attrGen].concat(generators);

    const materializers = profile.materializers
      .sort((a, b) => a.ordering - b.ordering)
      .map(d => Object.assign({}, {type: "materializer"}, d))
      .filter(this.filterFunc.bind(this));

    const formatters = formattersAll
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter(this.filterFunc.bind(this));

    const selectors = profile.selectors
      .sort((a, b) => a.title.localeCompare(b.title))
      .filter(this.filterFunc.bind(this));

    // If a search filter causes no results, hide the entire grouping. However, if
    // the ORIGINAL data has length 0, always show it, so the user can add the first one.
    const showGenerators = profile.generators.length === 0 || generators.length > 0;
    const showMaterializers = profile.materializers.length === 0 || materializers.length > 0;
    const showFormatters = formattersAll.length === 0 || formatters.length > 0;
    const showSelectors = profile.selectors.length === 0 || selectors.length > 0;


    return (
      <aside className={`cms-toolbox ${toolboxVisible ? "is-visible" : "is-hidden"}${toolboxDialogOpen ? " has-open-dialog" : ""}`}>

        {children} {/* the toggle toolbox button */}

        <FilterSearch
          label="filter by name, output, description..."
          namespace="cms"
          value={query}
          onChange={this.filter.bind(this)}
          onReset={this.onReset.bind(this)}
        />

        <ButtonGroup namespace="cms" buttons={[
          {
            onClick: () => this.setState({detailView: true}),
            active: detailView,
            namespace: "cms",
            icon: "th-list",
            iconPosition: "left",
            children: "detail view",
            fontSize: "xs"
          },
          {
            onClick: () => this.setState({detailView: false}),
            active: !detailView,
            namespace: "cms",
            icon: "list",
            iconPosition: "left",
            children: "output view",
            fontSize: "xs"
          }
        ]} />

        {!detailView &&
          <ul className="cms-button-list">
            {Object.keys(variables[localeDefault])
              .sort((a, b) => a.localeCompare(b))
              .filter(key => key !== "_genStatus" && key !== "_matStatus")
              .filter(key => key.toLowerCase().includes(query.toLowerCase()) || typeof variables[localeDefault][key] === "string" && variables[localeDefault][key].toLowerCase().includes(query.toLowerCase()))
              .map(key =>
                <li key={key} className="cms-button-item">
                  <Button
                    onClick={this.openGenerator.bind(this, key)}
                    namespace="cms"
                    fontSize="xxs"
                    fill
                  >
                    {key}: <ConsoleVariable value={variables[localeDefault][key]} />
                  </Button>
                </li>
              )}
          </ul>
        }

        {/* Hide the panels if not detailView - but SHOW them if forceOpen is set, which means
          * that someone has clicked an individual variable and wants to view its editor
          */}
        <div className={`cms-toolbox-deck-wrapper${detailView || forceOpen ? "" : " is-hidden"}`}>

          {(showGenerators || forceOpen) &&
            <Deck
              title="Generators"
              entity="generator"
              description="Variables constructed from JSON data calls."
              addItem={this.addItem.bind(this, "generator")}
              cards={generators.map(g =>
                <GeneratorCard
                  key={g.id}
                  minData={g}
                  context="generator"
                  hidden={!detailView}
                  attr={profile.attr || {}}
                  type="generator"
                />
              )}
            />
          }

          {(showMaterializers || forceOpen) &&
            <Deck
              title="Materializers"
              entity="materializer"
              description="Variables constructed from other variables. No API calls needed."
              addItem={this.addItem.bind(this, "materializer")}
              cards={materializers.map(m =>
                <GeneratorCard
                  key={m.id}
                  minData={m}
                  context="materializer"
                  hidden={!detailView}
                  type="materializer"
                  showReorderButton={materializers[materializers.length - 1].id !== m.id}
                />
              )}
            />
          }

          { detailView && showSelectors &&
            <Deck
              title="Selectors"
              entity="selector"
              description="Profile-wide Selectors."
              addItem={this.addItem.bind(this, "selector")}
              cards={selectors.map(s =>
                <SelectorCard
                  key={s.id}
                  minData={s}
                />
              )}
            />
          }

          { detailView && showFormatters &&
            <Deck
              title="Formatters"
              entity="formatter"
              addItem={this.addItem.bind(this, "formatter")}
              description="Javascript Formatters for Canon text components"
              cards={formatters.map(f =>
                <GeneratorCard
                  context="formatter"
                  key={f.id}
                  minData={f}
                  type="formatter"
                  variables={{}}
                />
              )}
            />
          }
        </div>
      </aside>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  status: state.cms.status,
  profile: state.cms.profiles.find(p => p.id === ownProps.id),
  formatters: state.cms.formatters
});

const mapDispatchToProps = dispatch => ({
  fetchVariables: (config, useCache) => dispatch(fetchVariables(config, useCache)),
  newEntity: (type, payload) => dispatch(newEntity(type, payload)),
  setStatus: status => dispatch(setStatus(status))
});

export default connect(mapStateToProps, mapDispatchToProps)(Toolbox);
