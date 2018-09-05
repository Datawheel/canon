// node scripts/cubes.js

const {Client} = require("mondrian-rest-client"), 
      fs = require("fs");

const client = new Client("https://canon-api.datausa.io");

client.cubes().then(cubes => {

  let row = "";
  cubes.sort((a, b) => a.name > b.name ? 1 : -1).forEach(cube => {
    const {dimensions, measures, annotations} = cube;
    row += `### CUBE: ${cube.name} \n`;
    row += "\n";
    if (annotations.source_name) row += "- [ ] source_name \n";
    if (annotations.source_description) row += "- [ ] source_description \n";
    if (annotations.source_link) row += "- [ ] source_link \n";
    if (annotations.dataset_name) row += "- [ ] dataset_name \n";
    if (annotations.dataset_link) row += "- [ ] dataset_link \n";
    if (annotations.topic) row += "- [ ] topic \n";
    if (annotations.subtopic) row += "- [ ] subtopic \n";
    if (annotations.details) row += "- [ ] details \n";
    row += "\n";

    measures.forEach(measure => {
      row += `### MEASURE: ${measure.name} \n`;
      if (measure.annotations.units_of_measurement) row += "- [ ] units_of_measurement \n";
      row += "\n";
    });

  });

  fs.writeFile("./scripts/cubes-audit.md", row, "utf8", err => {
    if (err) console.log(err);
    else console.log("created scripts/cubes-audit.md");
  });

});
