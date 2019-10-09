import {MultiClient} from "@datawheel/olap-client";
import {AnyAction, Dispatch} from "redux";

interface Action<T> {
  type: string;
  payload: T;
}

interface MiddlewareActionParams<T> {
  action: Action<T>;
  client: MultiClient;
  dispatch: Dispatch<AnyAction>;
  getState: () => GeneralState;
}
