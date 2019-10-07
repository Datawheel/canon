import {MultiClient as OLAPClient} from "@datawheel/olap-client";
import coreActions from "./coreActions";
import olapActions from "./olapActions";

/**
 * @template T
 * @typedef Action
 * @property {string} type
 * @property {T} payload
 */

/**
 * @template T
 * @typedef MiddlewareActionParams
 * @property {Action<T>} action
 * @property {OLAPClient} client
 * @property {import("redux").Dispatch<import("redux").AnyAction>} dispatch
 * @property {() => GeneralState} getState
 */

const actions = {
  ...coreActions,
  ...olapActions
};

/** @type {import("redux").Middleware<import("redux").Dispatch<import("redux").AnyAction>, GeneralState>} */
function vizbuilderMiddleware({dispatch, getState}) {
  const client = new OLAPClient();

  return next => action =>
    action.type in actions
      ? actions[action.type]({action, client, dispatch, getState})
      : next(action);
}

export default vizbuilderMiddleware;
