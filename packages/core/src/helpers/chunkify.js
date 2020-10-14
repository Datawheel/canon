import Loading from "$app/components/Loading";
import loadable from "@loadable/component";

/**
 * @param {Promise} statement The import() statement for the given component. Example: import("@datawheel/canon-cms")
 * @param {String} [name = "default"] The component name to import, needed for named exports.
 */
export default (statement, name = "default") => {
  const resolveComponent = components => components[name];
  const lazy = loadable(() => statement, {fallback: Loading, resolveComponent});
  lazy.resolveComponent = resolveComponent;
  return lazy;
};
