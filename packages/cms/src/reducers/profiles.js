export default (profiles = [], action) => {
  switch (action.type) {
    case "PROFILES_GET": 
      return action.data;
    case "PROFILE_NEW":
      return profiles.concat([action.data]);
    default: return profiles;
  }
};
