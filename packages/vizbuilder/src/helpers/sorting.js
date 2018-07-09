import sort from "fast-sort";
import union from "lodash/union";
import {unique} from "shorthash";

import {sortSlice} from "./random";

export function isTimeDimension(dimension) {
  return dimension.dimensionType === 1 || dimension.name === "Date";
}

export function injectCubeInfoOnMeasure(cubes) {
  // ensure `cubes` is an array
  cubes = [].concat(cubes);

  let nCbs = cubes.length;
  while (nCbs--) {
    const cube = cubes[nCbs];

    const cbName = cube.caption || cube.name;
    const cbTopic = cube.annotations.topic;
    const cbSubtopic = cube.annotations.subtopic;
    const selectorKey = `${cbTopic}_${cbSubtopic}_`;
    const sortKey = sortSlice(selectorKey);
    const sourceName = cube.annotations.source_name;
    // const sourceDesc = cube.annotations.source_description;
    // const sourceLink = cube.annotations.source_link;
    // const datasetName = cube.annotations.dataset_name;
    // const datasetLink = cube.annotations.dataset_link;

    cube.annotations._key = unique(cbName);

    let nMsr = cube.measures.length;
    while (nMsr--) {
      const measure = cube.measures[nMsr];
      const annotations = measure.annotations;

      annotations._key = unique(`${cbName} ${measure.name}`);
      annotations._cb_name = cbName;
      annotations._cb_topic = cbTopic;
      annotations._cb_subtopic = cbSubtopic;
      annotations._cb_sourceName = sourceName;
      annotations._selectorKey =
        selectorKey + (measure.caption || measure.name);
      annotations._sortKey = `${sortKey}${measure.caption ||
        measure.name}`.toLowerCase();
      // annotations._source_desc = sourceDesc;
      // annotations._source_link = sourceLink;
      // annotations._dataset_name = datasetName;
      // annotations._dataset_link = datasetLink;
    }

    let nDim = cube.dimensions.length;
    while (nDim--) {
      const dimension = cube.dimensions[nDim];
      const keyPrefix = `${cbName} ${dimension.name} `;

      let nHie = dimension.hierarchies.length;
      while (nHie--) {
        const hierarchy = dimension.hierarchies[nHie];

        let nLvl = hierarchy.levels.length;
        while (nLvl--) {
          const level = hierarchy.levels[nLvl];

          level.annotations._key = unique(keyPrefix + level.name);
        }
      }
    }
  }
}

export function getValidMeasures(cubes) {
  cubes = [].concat(cubes);
  const measures = [];

  let nCbs = cubes.length;
  while (nCbs--) {
    const cube = cubes[nCbs];
    let nMsr = cube.measures.length;
    while (nMsr--) {
      const measure = cube.measures[nMsr];
      // TODO: ensure this is checked server-side and remove
      if (/\smoe$/i.test(measure.name)) {
        continue;
      }
      const key = measure.annotations.error_for_measure;
      if (key === undefined) {
        measures.push(measure);
      }
    }
  }

  return sort(measures).asc(a => a.annotations._selectorKey);
}

export function getMeasureMOE(cube, measure) {
  const measureName = RegExp(measure.name, "i");

  if (cube.measures.indexOf(measure) > -1) {
    let nMsr = cube.measures.length;
    while (nMsr--) {
      const currentMeasure = cube.measures[nMsr];

      const key = currentMeasure.annotations.error_for_measure;
      if (key && measureName.test(key)) {
        return currentMeasure;
      }
    }
  }

  return undefined;
}

export function getValidDimensions(cube) {
  return cube.dimensions.filter(dim => !isTimeDimension(dim));
}

export function getValidDrilldowns(dimensions) {
  // TODO: check if it's necessary to prepare this for NamedSets
  return dimensions.reduce(reduceLevelsFromDimension, []);
}

export function reduceLevelsFromDimension(container, dimension) {
  return isTimeDimension(dimension)
    ? container
    : dimension.hierarchies.reduce(reduceLevelsFromHierarchy, container);
}

export function reduceLevelsFromHierarchy(container, hierarchy) {
  return container.concat(hierarchy.levels.slice(1));
}

export function joinDrilldownList(array, drilldown) {
  array = array.filter(dd => dd.hierarchy !== drilldown.hierarchy);
  drilldown = [].concat(drilldown || []);
  return sort(union(array, drilldown)).asc(
    a => a.hierarchy.dimension.dimensionType
  );
}

export function getTimeDrilldown(cube) {
  const timeDim = cube.timeDimension || cube.dimensionsByName.Date;
  if (timeDim) {
    const timeHie = timeDim.hierarchies.slice(-1).pop();
    if (timeHie) {
      return timeHie.levels.slice(1, 2).pop();
    }
  }
  return undefined;
}

export function composePropertyName(item) {
  let txt = item.name;
  if ("hierarchy" in item) {
    const hname = item.hierarchy.name;
    if (hname !== item.name && hname !== item.hierarchy.dimension.name) {
      txt = `${item.hierarchy.name} › ${txt}`;
    }
    if (item.name !== item.hierarchy.dimension.name) {
      txt = `${item.hierarchy.dimension.name} › ${txt}`;
    }
  }
  return txt;
}

export function getIncludedMembers(query, dataset) {
  if (dataset.length) {
    return query.getDrilldowns().reduce((members, dd) => {
      const key = dd.name;
      const set = {};

      let n = dataset.length;
      while (n--) {
        const value = dataset[n][key];
        set[value] = 0;
      }

      members[key] = Object.keys(set).sort();
      return members;
    }, {});
  }
  else {
    return {};
  }
}
