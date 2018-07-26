import sort from "fast-sort";
import union from "lodash/union";
import {unique} from "shorthash";

export function isTimeDimension(dimension) {
  return (
    dimension.dimensionType === 1 ||
    dimension.name === "Date" ||
    dimension.name === "Year"
  );
}

export function injectCubeInfoOnMeasure(cubes) {
  let nCbs = cubes.length;
  while (nCbs--) {
    const cube = cubes[nCbs];

    if (cube.annotations.hide_in_ui) {
      cubes.splice(nCbs, 1);
      continue;
    }

    const cbName = cube.caption || cube.name;
    const cbTopic = cube.annotations.topic;
    const cbSubtopic = cube.annotations.subtopic;
    const selectorKey = `${cbTopic}_${cbSubtopic}_`;
    const sortKey = sortSlice(selectorKey);
    const sourceName = cube.annotations.source_name;

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

export function preventHierarchyIncompatibility(array, interestLevel) {
  const interestHierarchy = interestLevel.hierarchy;

  let n = array.length;
  while (n--) {
    const level = array[n];
    if (
      level.hierarchy === interestHierarchy &&
      level.depth > interestLevel.depth
    ) {
      array.splice(n, 1);
    }
  }
}

export function reduceLevelsFromDimension(container, dimension) {
  return isTimeDimension(dimension)
    ? container
    : dimension.hierarchies.reduce((container, hierarchy) => container.concat(hierarchy.levels.slice(1)), container);
}

export function joinDrilldownList(array, drilldown) {
  array = array.filter(dd => dd.hierarchy !== drilldown.hierarchy);
  drilldown = [].concat(drilldown || []);
  return sort(union(array, drilldown)).asc(
    a => a.hierarchy.dimension.dimensionType
  );
}

export function getTimeDrilldown(cube) {
  const timeDim =
    cube.timeDimension ||
    cube.dimensionsByName.Date ||
    cube.dimensionsByName.Year;
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
    const dname = item.hierarchy.dimension.name;
    if (hname !== item.name && hname !== dname) {
      txt = `${item.hierarchy.name} › ${txt}`;
    }
    if (dname !== item.name) {
      txt = `${dname} › ${txt}`;
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

/**
 * Slices a string to
 * @param {string} string The string to slice
 * @returns {string}
 */
export function sortSlice(string) {
  string = `${string}`.replace(/\W/g, "").toLowerCase();
  return `${string.slice(0, 5)}-----`.slice(0, 6);
}

export function sortByCustomKey(key) {
  return (a, b) => `${a[key]}`.localeCompare(`${b[key]}`);
}
