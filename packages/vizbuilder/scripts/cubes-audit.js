// node scripts/cubes.js

const {Client} = require("mondrian-rest-client"), 
      fs = require("fs");

const client = new Client("https://canon-api.datausa.io");

client.cubes().then(cubes => {

  let row = "";

  cubes.map(cube => {
    const {dimensions, measures, annotations} = cube;
    row += `### ${cube.name} \n`;
    row += "\n";
    row += `- [${annotations.source_name ? "x" : " "}] source_name \n`;
    row += `- [${annotations.source_description ? "x" : " "}] source_description \n`;
    row += `- [${annotations.source_link ? "x" : " "}] source_link \n`;
    row += "\n";
  });

  fs.writeFile("./scripts/cubes-audit.md", row, "utf8", err => {
    if (err) console.log(err);
    else console.log("created scripts/cubes-audit.md");
  });

});
