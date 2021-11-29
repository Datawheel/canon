export default (cubeData = {}, action) => {
  switch (action.type) {
    case "CUBEDATA_GET": 
      return action.data;
    default: return cubeData;
  }
};
