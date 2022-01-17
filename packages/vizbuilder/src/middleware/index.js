import {MultiClient as OLAPClient} from "@datawheel/olap-client";
import {doQueryInyect} from "../store/query/actions";
import {doRunQueryCore, doValidateParams} from "./actions";
import fetchEffects from "./effectFetch";
import initializeEffects from "./effectInitialize";
import updateEffects from "./effectUpdate";
import validateEffects from "./effectValidate";

const effects = {
  ...fetchEffects,
  ...initializeEffects,
  ...updateEffects,
  ...validateEffects
};

/** @type {import("redux").Middleware<import("redux").Dispatch, GeneralState>} */
function vizbuilderMiddleware({dispatch, getState}) {
  const client = new OLAPClient();

  typeof window === "object" &&
    window.addEventListener("popstate", evt => {
      dispatch(doQueryInyect(evt.state));
      dispatch(doValidateParams());
      dispatch(doRunQueryCore());
    });

  return next => action => action.type in effects
    ? effects[action.type]({action, client, dispatch, getState})
    : next(action);
}

export default vizbuilderMiddleware;
