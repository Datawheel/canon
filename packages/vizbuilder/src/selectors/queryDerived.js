import {createSelector} from "reselect";
import {selectCube, selectMeasure} from "./queryRaw";

export const selectTimeLevel = createSelector(selectCube, cube => {
  if (cube) {
    const timeDimension = cube.dimensions.find(dimension => dimension.type === "TIME");
    if (timeDimension) {
      const defaultHierarchy = timeDimension.defaultHierarchy;
      const hierarchy = defaultHierarchy
        ? timeDimension.hierarchies.find(hierarchy => hierarchy.name === defaultHierarchy)
        : timeDimension.hierarchies[0];
      if (hierarchy) {
        return hierarchy.levels[0];
      }
    }
  }
});

export const selectGeoLevel = createSelector(selectCube, cube => {
  if (cube) {
    const timeDimension = cube.dimensions.find(
      dimension => dimension.type === "GEOGRAPHY"
    );
    if (timeDimension) {
      const defaultHierarchy = timeDimension.defaultHierarchy;
      const hierarchy = defaultHierarchy
        ? timeDimension.hierarchies.find(hierarchy => hierarchy.name === defaultHierarchy)
        : timeDimension.hierarchies[0];
      if (hierarchy) {
        return hierarchy.levels[0];
      }
    }
  }
});

export const selectMeasureLCI = createSelector(
  [selectMeasure, selectCube],
  (measure, cube) => {
    if (measure && cube) {
      const {name: measureName} = measure;
      return cube.measures.find(msr => msr.isLCIFor === measureName);
    }
  }
);

export const selectMeasureUCI = createSelector(
  [selectMeasure, selectCube],
  (measure, cube) => {
    if (measure && cube) {
      const {name: measureName} = measure;
      return cube.measures.find(msr => msr.isUCIFor === measureName);
    }
  }
);

export const selectMeasureMOE = createSelector(
  [selectMeasure, selectCube],
  (measure, cube) => {
    if (measure && cube) {
      const {name: measureName} = measure;
      return cube.measures.find(msr => msr.isMOEFor === measureName);
    }
  }
);

export const selectMeasureSource = createSelector(
  [selectMeasure, selectCube],
  (measure, cube) => {
    if (measure && cube) {
      const {name: measureName} = measure;
      return cube.measures.find(msr => msr.isSourceFor === measureName);
    }
  }
);

export const selectMeasureCollection = createSelector(
  [selectMeasure, selectCube],
  (measure, cube) => {
    if (measure && cube) {
      const {name: measureName} = measure;
      return cube.measures.find(msr => msr.isCollectionFor === measureName);
    }
  }
);
