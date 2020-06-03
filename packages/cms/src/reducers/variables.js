export default (variables = {}, action) => {
  switch (action.type) {
    case "VARIABLES_SET": 
      return action.data.variables;
    default: return variables;
  }
};
