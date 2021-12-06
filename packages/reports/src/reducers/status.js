export default (status = {}, action) => {
  switch (action.type) {
    // Basic assign
    case "STATUS_SET":
      return Object.assign({}, status, action.data);
    default: return status;
  }
};
