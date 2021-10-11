import React, {Component} from "react";
import {connect} from "react-redux";
import Deck from "./Deck";

import Button from "../fields/Button";
import ButtonGroup from "../fields/ButtonGroup";
import FilterSearch from "../fields/FilterSearch";
import VariableCard from "../cards/VariableCard";
import SelectorCard from "../cards/SelectorCard";

import ConsoleVariable from "../variables/ConsoleVariable";

import {fetchVariables, newEntity} from "../../actions/profiles";
import {setStatus} from "../../actions/status";

import {PARENT_TYPES} from "../../utils/consts/cms";

import "./Toolbox.css";

class Toolbox extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentView: "generators",
      view: "detail",
      query: ""
    };
  }

  componentDidMount() {
    const {parentType} = this.props;
    if (parentType === PARENT_TYPES.STORY) this.props.fetchVariables({type: "story_generator"});
  }

  componentDidUpdate(prevProps) {
    const {parentType} = this.props;
    if (parentType === PARENT_TYPES.PROFILE) {
      const oldSlugs = prevProps.status.previews ? prevProps.status.previews.map(p => p.slug).join() : prevProps.status.previews;
      const newSlugs = this.props.status.previews ? this.props.status.previews.map(p => p.slug).join() : this.props.status.previews;
      const oldIDs = prevProps.status.previews ? prevProps.status.previews.map(p => p.id).join() : prevProps.status.previews;
      const newIDs = this.props.status.previews ? this.props.status.previews.map(p => p.id).join() : this.props.status.previews;
      const changedSinglePreview = oldSlugs === newSlugs && oldIDs !== newIDs;
      const changedEntireProfile = oldSlugs !== newSlugs;
      const changedLocale = prevProps.status.localeSecondary !== this.props.status.localeSecondary;

      // TODO: This can be streamlined to make use of a caching system (see NavBar.jsx and profiles.js)
      // When a profile is loaded, save its current previews and variables (all we have is variables right now) and
      // Responsibly reload them when changing entire profile. For now, deal with the more heavy reload
      if (changedSinglePreview || changedEntireProfile || changedLocale) {
        this.props.fetchVariables({type: "generator"});
      }
    }
    if (parentType === PARENT_TYPES.STORY) {
      if (prevProps.id !== this.props.id) this.props.fetchVariables({type: "story_generator"});
    }

    // Detect Deletions
    const {justDeleted} = this.props.status;
    if (JSON.stringify(prevProps.status.justDeleted) !== JSON.stringify(justDeleted)) {
      // Providing fetchvariables (and ultimately, /api/variables) with a now deleted generator or materializer id
      // is handled gracefully - it prunes the provided id from the variables object and re-runs necessary gens/mats.
      if (justDeleted.type === "generator") {
        this.props.fetchVariables({type: "generator", id: justDeleted.id});
      }
      else if (justDeleted.type === "materializer") {
        this.props.fetchVariables({type: "materializer", id: justDeleted.id});
      }
    }
  }

  addItem(type) {
    const {parentType} = this.props;
    const payload = parentType === PARENT_TYPES.STORY ? {story_id: this.props.profile.id} : {profile_id: this.props.profile.id};
    this.props.newEntity(type, payload);
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
    const {dialogOpen} = this.props.status;
    const fields = ["name", "description", "title"];
    const matched = fields.map(f => d[f] !== undefined ? d[f].toLowerCase().includes(query) : false).some(d => d);
    const opened = dialogOpen && d.type === dialogOpen.type && d.id === dialogOpen.id;
    return matched || opened;
  }

  openGenerator(key) {
    const {localeDefault} = this.props.status;
    const {variables} = this.props;
    const vars = variables[localeDefault];

    const gens = Object.keys(vars._genStatus);
    gens.forEach(id => {
      if (vars._genStatus[id][key]) {
        this.props.setStatus({dialogOpen: {type: "generator", id: Number(id), force: true}});
      }
    });

    const mats = Object.keys(vars._matStatus);
    mats.forEach(id => {
      if (vars._matStatus[id][key]) {
        this.props.setStatus({dialogOpen: {type: "materializer", id: Number(id), force: true}});
      }
    });
  }

  maybePrepend(d) {
    return `${this.props.parentType === PARENT_TYPES.STORY ? "story_" : ""}${d}`;
  }

  render() {
    const {view, query} = this.state;
    const {children, toolboxVisible, parentType} = this.props;
    const {profile, variables} = this.props;
    const formattersAll = this.props.formatters;
    const {localeDefault, localeSecondary, dialogOpen} = this.props.status;

    if (!profile) return null;

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

    if (parentType === PARENT_TYPES.PROFILE && this.props.status.profilesLoaded) generators = [attrGen].concat(generators);

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

    let outputResults = [];
    const outputCutoff = 200;
    let isCutoff = false;
    if (view === "output") {
      outputResults = Object.keys(variables[localeDefault])
        .sort((a, b) => a.localeCompare(b))
        .filter(key => key !== "_genStatus" && key !== "_matStatus")
        .filter(key => key.toLowerCase().includes(query.toLowerCase()) || typeof variables[localeDefault][key] === "string" && variables[localeDefault][key].toLowerCase().includes(query.toLowerCase()));
      if (outputResults.length > outputCutoff) {
        outputResults = outputResults.slice(0, outputCutoff);
        isCutoff = true;
      }
    }

    const fullView = view === "lite" || view === "detail";



    return (
      <aside className={`cms-toolbox ${toolboxVisible ? "is-visible" : "is-hidden"}${dialogOpen ? " has-open-dialog" : ""}`}>

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
            onClick: () => this.setState({view: "detail"}),
            active: view === "detail",
            namespace: "cms",
            icon: "th-list",
            iconPosition: "left",
            children: "detail view",
            fontSize: "xs"
          },
          {
            onClick: () => this.setState({view: "lite"}),
            active: view === "lite",
            namespace: "cms",
            icon: "square",
            iconPosition: "left",
            children: "lite view",
            fontSize: "xs"
          },
          {
            onClick: () => this.setState({view: "output"}),
            active: view === "output",
            namespace: "cms",
            icon: "list",
            iconPosition: "left",
            children: "output view",
            fontSize: "xs"
          }
        ]} />

        {view === "output" &&
          <div>
            <ul className="cms-button-list">
              {outputResults
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
            {isCutoff && <span className="cms-output-bumper">...Some results hidden, enter a more specific query</span>}
          </div>
        }

        {/* Hide the panels if not fullView - but SHOW them if dialogOpen is set, which means
          * that someone has clicked an individual variable and wants to view its editor
          */}
        <div className={`cms-toolbox-deck-wrapper${fullView || dialogOpen ? "" : " is-hidden"}`}>

          {(showGenerators || dialogOpen) &&
            <Deck
              title="Generators"
              entity={this.maybePrepend.bind(this)("generator")}
              description="Variables constructed from JSON data calls."
              addItem={this.addItem.bind(this, this.maybePrepend.bind(this)("generator"))}
              cards={generators.map((g, i) =>
                <VariableCard
                  key={g.id}
                  minData={g}
                  context={this.maybePrepend.bind(this)("generator")}
                  hidden={!fullView}
                  type={this.maybePrepend.bind(this)("generator")}
                  readOnly={i === 0}
                  compact={view === "lite"}
                  usePortalForAlert
                />
              )}
            />
          }

          {(showMaterializers || dialogOpen) &&
            <Deck
              title="Materializers"
              entity={this.maybePrepend.bind(this)("materializer")}
              description="Variables constructed from other variables. No API calls needed."
              addItem={this.addItem.bind(this, this.maybePrepend.bind(this)("materializer"))}
              cards={materializers.map(m =>
                <VariableCard
                  key={m.id}
                  minData={m}
                  context={this.maybePrepend.bind(this)("materializer")}
                  hidden={!fullView}
                  type={this.maybePrepend.bind(this)("materializer")}
                  showReorderButton={materializers[materializers.length - 1].id !== m.id}
                  compact={view === "lite"}
                  usePortalForAlert
                />
              )}
            />
          }

          { fullView && showSelectors &&
            <Deck
              title="Selectors"
              entity={this.maybePrepend.bind(this)("selector")}
              description={`${parentType === PARENT_TYPES.PROFILE ? "Profile" : "Story"}-wide Selectors.`}
              addItem={this.addItem.bind(this, this.maybePrepend.bind(this)("selector"))}
              cards={selectors.map(s =>
                <SelectorCard
                  key={s.id}
                  minData={s}
                  compact={view === "lite"}
                  parentType={parentType}
                  type={this.maybePrepend.bind(this)("selector")}
                  usePortalForAlert
                />
              )}
            />
          }

          { fullView && showFormatters &&
            <Deck
              title="Formatters"
              entity="formatter"
              addItem={this.addItem.bind(this, "formatter")}
              description="Javascript Formatters for Canon text components"
              cards={formatters.map(f =>
                <VariableCard
                  context="formatter"
                  key={f.id}
                  minData={f}
                  compact={view === "lite"}
                  type="formatter"
                  usePortalForAlert
                />
              )}
            />
          }
        </div>
      </aside>
    );
  }
}

Toolbox.defaultProps = {
  parentType: PARENT_TYPES.PROFILE
};

const mapStateToProps = (state, ownProps) => ({
  variables: state.cms.variables,
  status: state.cms.status,
  profile: state.cms[ownProps.parentType === PARENT_TYPES.PROFILE ? "profiles" : "stories"].find(p => p.id === ownProps.id),
  formatters: state.cms.formatters
});

const mapDispatchToProps = dispatch => ({
  fetchVariables: (config, useCache) => dispatch(fetchVariables(config, useCache)),
  newEntity: (type, payload) => dispatch(newEntity(type, payload)),
  setStatus: status => dispatch(setStatus(status))
});

export default connect(mapStateToProps, mapDispatchToProps)(Toolbox);
