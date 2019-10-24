export default (formatters = [], action) => {
  switch (action.type) {
    case "FORMATTER_GET": 
      console.log("hey", action.data);
      return action.data;
    case "FORMATTER_NEW":
      return formatters.concat([action.data]);
    case "FORMATTER_UPDATE":
      return formatters.map(f => f.id === action.data.id ? action.data : f);
    case "FORMATTER_DELETE":
      return action.data;
    default: return formatters;
  }
};
