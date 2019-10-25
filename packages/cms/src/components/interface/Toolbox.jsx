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
    const previewsChanged = JSON.stringify(prevProps.status.previews) !== JSON.stringify(this.props.status.previews);
    const localeChanged = prevProps.status.localeSecondary !== this.props.status.localeSecondary;
    // const firstLoad = prevProps.profile && !prevProps.profile.toolboxLoaded && this.props.profile && this.props.profile.toolboxLoaded;
    const bothLoaded = prevProps.profile && this.props.profile;
    const generatorDeleted = bothLoaded && prevProps.profile.generators.length - 1 === this.props.profile.generators.length;
    const materializerDeleted = bothLoaded && prevProps.profile.materializers.length - 1 === this.props.profile.materializers.length;

    if (previewsChanged || localeChanged) {
      this.props.fetchVariables({type: "generator", ids: this.props.profile.generators.map(g => g.id)});
    }
    // Providing fetchvariables (and ultimately, /api/variables) with a now deleted generator or materializer id
    // is handled gracefully - it prunes the provided id from the variables object and re-runs necessary gens/mats.
    if (generatorDeleted) {
      this.props.fetchVariables({type: "generator", ids: [this.props.profile.deletedGeneratorID]});
    }
    if (materializerDeleted) {
      this.props.fetchVariables({type: "materializer", ids: [this.props.profile.deletedMaterializerID]});
    }

  }

  addItem(type) {
    this.props.newEntity(type, {profile_id: this.props.profile.id});
  }

  onMove() {
    this.forceUpdate();
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
    const matched = fields.map(f => d[f] ? d[f].toLowerCase().includes(query) : false).some(d => d);
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
    const {variables, localeDefault, localeSecondary, forceOpen} = this.props.status;

    const dataLoaded = profile;

    if (!dataLoaded) return null;

    const varsLoaded = variables;
    const defLoaded = localeSecondary || variables && !localeSecondary && variables[localeDefault];
    const locLoaded = !localeSecondary || variables && localeSecondary && variables[localeDefault] && variables[localeSecondary];

    if (!varsLoaded || !defLoaded || !locLoaded) return <div className="cms-toolbox is-loading"><h3>Loading...</h3></div>;

    const generators = profile.generators
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(d => Object.assign({}, {type: "generator"}, d))
      .filter(this.filterFunc.bind(this));

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
      <aside className={`cms-toolbox ${toolboxVisible ? "is-visible" : "is-hidden"}`}>

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
                  id={g.id}
                  context="generator"
                  hidden={!detailView}
                  item={g}
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
                  id={m.id}
                  context="materializer"
                  hidden={!detailView}
                  item={m}
                  type="materializer"
                  parentArray={profile.materializers}
                  onMove={this.onMove.bind(this)}
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
                  id={s.id}
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
                  id={f.id}
                  item={f}
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
  fetchVariables: config => dispatch(fetchVariables(config)),
  newEntity: (type, payload) => dispatch(newEntity(type, payload)),
  setStatus: status => dispatch(setStatus(status))
});

export default connect(mapStateToProps, mapDispatchToProps)(Toolbox);
