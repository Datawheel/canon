const fs = require("fs"),
      path = require("path"),
      shell = require("shelljs");

module.exports = function(sequelize, db) {

  const f = sequelize.define("formatter",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: db.STRING,
        defaultValue: ""
      },
      description: {
        type: db.TEXT,
        defaultValue: ""
      },
      logic: {
        type: db.TEXT,
        defaultValue: "return n;"
      }
    },
    {
      tableName: "canon_cms_formatter",
      freezeTableName: true,
      timestamps: false
    }
  );

  const folder = path.join(__dirname, "../utils/formatters");
  f.seed = fs.readdirSync(folder)
    .filter(file => file && file.indexOf(".") !== 0)
    .map(file => {

      const fullPath = path.join(folder, file);
      const content = shell.cat(fullPath).stdout;
      const name = file.slice(0, -3);

      let description = content.match(/^\/[\s\*\n\r]+([^\*\/]+)/m);
      if (description) {
        description = description[1]
          .replace(/\r/g, " ")
          .replace(/^[\n\r\s]*/gm, "")
          .replace(/[\n\r\s]*$/gm, "");
      }
      else description = "";

      const logic = content
        .match(/function[A-z0-9\s\(\)\,]+\{((.|\n|\r)*)\}/m)[1]
        .replace(/\n\s\s/gm, "\n")
        .replace(/^[\r|\n]*/gm, "")
        .replace(/[\n\r\s]*$/gm, "");

      return {name, description, logic};

    });

  return f;

};
