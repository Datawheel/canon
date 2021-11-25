const variable = /[A-z0-9]*\{\{[^\}]+\}\}/g;
const greybar = "<span style=\"background-color:lightgrey; color:lightgrey;\">spoiler</span>";
const replace = d => typeof d === "string" ? d.replace(variable, greybar) : d;

module.exports = obj => Object.keys(obj).reduce((acc, d) => ({...acc, [d]: replace(d)}), {});
