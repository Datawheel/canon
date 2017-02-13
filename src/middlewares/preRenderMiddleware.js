export default (dispatch, components, params) => Promise.all(
  components
    .reduce((previous, current) => (current.need || []).concat(previous), [])
    .map(need => dispatch(need(params))));
