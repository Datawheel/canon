const fs = require("fs");
const path = require("path");

const catcher = e => console.log("error: ", e);

const loadModels = (db, modelPath, clear) => {
  const folder = path.join(__dirname, modelPath);
  fs.readdirSync(folder)
    .filter(file => file && file.indexOf(".") !== 0)
    .forEach(file => {
      const fullPath = path.join(folder, file);
      const model = db.import(fullPath);
      db[model.name] = model;
    });
  Object.keys(db).forEach(modelName => {
    if ("associate" in db[modelName]) db[modelName].associate(db);
  });
  if (clear) {
    return db.sync({force: true}).catch(catcher);
  }
  else {
    return db.sync().catch(catcher);
  }
};

module.exports = loadModels;
