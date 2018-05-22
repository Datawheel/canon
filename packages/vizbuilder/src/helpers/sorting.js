export function getValidDrilldowns(cube) {
  return cube.dimensions.reduce(flattenDimensions, []);
}

export function flattenDimensions(container, dimension) {
  return dimension.dimensionType === 1
    ? container
    : dimension.hierarchies.reduce(flattenHierarchies, container);
}

export function flattenHierarchies(container, hierarchy) {
  return container.concat(hierarchy.levels.slice(1));
}
