// Check if a user-created optionsArray is valid as a selector
module.exports = optionsArray => {
  const arrayExists = optionsArray && Array.isArray(optionsArray);
  if (!arrayExists) return "Error: Selected variable is not an array";
  const hasLength = optionsArray.length > 0;
  if (!hasLength) return "Error: Selected array has no length";
  const hasOptions = optionsArray.every(d => typeof d === "string" || d && d.option);
  if (!hasOptions) return "Error: Objects in selected array are missing option keys";
  const allowedIsString = optionsArray.every(d => d.allowed !== undefined ? typeof d.allowed === "string" : true);
  if (!allowedIsString) return "Error: 'allowed' key must be of type string";
  return "valid";
};
