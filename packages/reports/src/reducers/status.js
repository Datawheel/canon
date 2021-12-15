export default (status = {}, action) => {
  switch (action.type) {
    // Basic assign
    case "STATUS_SET":
      return {...status, ...action.data};
    default: return status;
  }
};
