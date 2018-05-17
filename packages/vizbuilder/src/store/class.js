/**
 * @template T
 * @class Store<T>
 * @prop {T} state
 * @prop {Array<(state) => void>} listeners
 */
export default class Store {
  listeners = [];

  constructor(initialState) {
    this.state = initialState;
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    const state = {
      ...this.state,
      ...newState
    };
    this.state = state;
    this.callback(state);
  }

  callback(state) {
    let i = this.listeners.length;
    while (i--) this.listeners[i](state);
  }

  addListener(listener) {
    this.listeners.push(listener);
    return this.removeListener.bind(this, listener);
  }

  removeListener(listener) {
    const index = this.listeners.indexOf(listener);
    this.listeners.splice(index, 1);
  }
}
