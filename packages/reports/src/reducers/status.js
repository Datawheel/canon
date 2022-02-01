export default (status = {}, action) => {
  switch (action.type) {
    // Basic assign
    case "STATUS_SET":
      return {...status, ...action.data};
    case "SECTION_ACTIVATE":
      return {...status, activeSection: action.id};
    default: return status;
  }
};
