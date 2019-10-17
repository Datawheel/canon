export default (profiles = [], action) => {
  switch (action.type) {
    case "PROFILE_NEW":
      return profiles.concat([action.data]);
    default: return profiles;
  }
};
