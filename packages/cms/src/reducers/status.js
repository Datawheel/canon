export default (status = {}, action) => {
  switch (action.type) {
    case "STATUS_SET": 
      return Object.assign({}, status, action.data);
    default: return status;
  }
};
