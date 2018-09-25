import React from "react";
import PropTypes from "prop-types";

import {
  findByName,
  getMeasureCI,
  getMeasureMOE,
  getMeasureSource,
  getTimeDrilldown,
  getValidDimensions,
  getValidDrilldowns,
  matchDefault,
  preventHierarchyIncompatibility,
  reduceLevelsFromDimension,
  removeDuplicateLevels,
  finishBuildingStateFromParameters
} from "../../helpers/sorting";

import BaseSelect from "./BaseSelect";
import ConditionalAnchor from "./ConditionalAnchor";
import ConditionManager from "./ConditionManager";
import LevelSelect from "./LevelSelect";
import MeasureSelect from "./MeasureSelect";

import "./style.css";

class Sidebar extends React.PureComponent {
  constructor(props) {
    super(props);

    this.setDimension = this.setDimension.bind(this);
    this.setDrilldown = this.setDrilldown.bind(this);
    this.setMeasure = this.setMeasure.bind(this);
  }

  setDimension(dimension) {
    const {dimensions} = this.props.options;
    const {loadControl, fetchQuery} = this.context;
    const {defaultQuery = []} = this.props;
    const defaultLevel = [].concat(defaultQuery.defaultLevel).reverse();

    return loadControl(() => {
      const levels = reduceLevelsFromDimension([], dimension);
      const drilldown = matchDefault(findByName, levels, defaultLevel, true);

      const drilldowns = getValidDrilldowns(dimensions);
      preventHierarchyIncompatibility(drilldowns, drilldown);
      removeDuplicateLevels(levels);

      return {
        options: {drilldowns, levels},
        query: {dimension, drilldown},
        queryOptions: {
          parents: drilldown.depth > 1
        }
      };
    }, fetchQuery);
  }

  setDrilldown(drilldown) {
    const {dimensions, levels} = this.props.options;
    const {loadControl, fetchQuery} = this.context;

    if (levels.indexOf(drilldown) > -1) {
      return loadControl(() => {
        const drilldowns = getValidDrilldowns(dimensions);
        preventHierarchyIncompatibility(drilldowns, drilldown);

        return {
          options: {drilldowns},
          query: {drilldown},
          queryOptions: {
            parents: drilldown.depth > 1
          }
        };
      }, fetchQuery);
    }

    return undefined;
  }

  setMeasure(measure) {
    const {defaultQuery, options, query} = this.props;
    const {loadControl, fetchQuery} = this.context;

    return loadControl(() => {
      const cubeName = measure.annotations._cb_name;
      const cube = options.cubes.find(cube => cube.name === cubeName);
      const lci = getMeasureCI(cube, measure, "LCI");
      const uci = getMeasureCI(cube, measure, "UCI");
      const moe = getMeasureMOE(cube, measure);
      const timeDrilldown = getTimeDrilldown(cube);

      const dimensions = getValidDimensions(cube);
      const drilldowns = getValidDrilldowns(dimensions);
      const sources = getMeasureSource(cube, measure);

      const state = {
        options: {dimensions, drilldowns},
        query: {
          cube,
          measure,
          lci,
          uci,
          moe,
          timeDrilldown
        },
        queryOptions: {
          moe,
          collection: sources.collectionMeasure,
          source: sources.sourceMeasure,
          timeDrilldown: getTimeDrilldown(cube)
        }
      };

      if (query.cube !== cube) {
        state.query.conditions = [];
      }

      return finishBuildingStateFromParameters(state, defaultQuery);
    }, fetchQuery);
  }

  render() {
    const {query, options} = this.props;

    if (!query.cube) return null;

    const measureDetails = query.measure.annotations.details || "";

    return (
      <div className="area-sidebar">
        <div className="wrapper">
          <div className="control select-measure">
            <p className="label">Showing</p>
            <MeasureSelect
              className="custom-select"
              items={options.measures}
              value={query.measure}
              onItemSelect={this.setMeasure}
            />
            <p className="details">{measureDetails}</p>
          </div>

          <div className="control">
            <div className="control select-dimension">
              <p className="label">Grouped by</p>
              <BaseSelect
                className="custom-select"
                filterable={false}
                items={options.dimensions}
                value={query.dimension}
                onItemSelect={this.setDimension}
              />
            </div>

            <div className="control select-level">
              <p className="label">At depth level</p>
              <LevelSelect
                className="custom-select"
                filterable={false}
                items={options.levels}
                value={query.drilldown}
                onItemSelect={this.setDrilldown}
              />
            </div>
          </div>

          <ConditionManager
            className="control"
            query={query}
            options={options}
          />

          {this.renderSourceBlock.call(this)}
        </div>
      </div>
    );
  }

  renderSourceBlock() {
    const ann = this.props.query.cube.annotations;

    return (
      <div className="control sources">
        <p hidden={!ann.source_name}>
          <span>Source: </span>
          <ConditionalAnchor className="source-link" href={ann.source_link}>
            {ann.source_name}
          </ConditionalAnchor>
        </p>
        <p hidden={!ann.source_description}>{ann.source_description}</p>
        <p hidden={!ann.dataset_name}>
          <span>Dataset: </span>
          <ConditionalAnchor className="source-link" href={ann.dataset_link}>
            {ann.dataset_name}
          </ConditionalAnchor>
        </p>
      </div>
    );
  }
}

Sidebar.contextTypes = {
  fetchQuery: PropTypes.func,
  loadControl: PropTypes.func
};

export default Sidebar;
