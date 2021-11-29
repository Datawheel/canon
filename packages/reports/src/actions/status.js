/** */
export function setStatus(status) {
  return function(dispatch) {
    dispatch({type: "STATUS_SET", data: status});
  };
}
