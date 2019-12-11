const {IconNames} = require("@blueprintjs/icons");

/** grabs the list of blueprint icons */
const blueprintIcons = Object.keys(IconNames).map(icon => icon.replace(/_/g, "-").toLowerCase());

module.exports = blueprintIcons;
