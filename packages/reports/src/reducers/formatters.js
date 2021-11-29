export default (formatters = [], action) => {
  switch (action.type) {
    case "FORMATTER_GET": 
      return action.data;
    case "FORMATTER_NEW":
      return formatters.concat([action.data]);
    case "FORMATTER_UPDATE":
      return action.data.formatters;
    case "FORMATTER_DELETE":
      return action.data;
    default: return formatters;
  }
};
