const Sequelize = require("sequelize"),
      path = require("path"),
      shell = require("shelljs");

let everDetect = false;

module.exports = async function(config) {

  const {modules, name, paths} = config;
  const {appPath, serverPath} = paths;

  const moduleName = require(path.join(serverPath, "helpers/moduleName")), 
        readFiles = require(path.join(serverPath, "helpers/readFiles")),
        title = require(path.join(serverPath, "helpers/title"));

  const dbName = process.env.CANON_DB_NAME;
  const dbUser = process.env.CANON_DB_USER;
  const dbHost = process.env.CANON_DB_HOST || "127.0.0.1";
  const dbPw = process.env.CANON_DB_PW || null;
  const engine = process.env.CANON_DB_ENGINE || "postgres";
  const sqlite = engine === "sqlite";

  const files = [];
  if (sqlite || dbName && dbUser) {
    for (let i = 0; i < modules.length; i++) {
      const folder = modules[i];
      const dbFolder = path.join(folder, "db/");
      if (shell.test("-d", dbFolder)) {
        if (!files.length) {

          title(`${everDetect ? "Re-m" : "M"}ounting Database Models`, "🗄️");

          if (engine === "sqlite") {
            const storage = path.join(appPath, "../sqlite/cms.sqlite");
            config.db = new Sequelize({
              dialect: "sqlite",
              storage,
              logging: false
            });
          }
          else {
            config.db = new Sequelize(dbName, dbUser, dbPw,
              {
                host: dbHost,
                dialect: "postgres",
                define: {timestamps: true},
                logging: () => {},
                operatorsAliases: Sequelize.Op
              }
            );
            shell.echo(`Database: ${dbUser}@${dbHost}`);
          }
         
          everDetect = true;

        }
        files.push(dbFolder);
        const module = moduleName(dbFolder) || moduleName(name) || name;
        const {db} = config;
        readFiles(dbFolder)
          .forEach(file => {
            const model = db.import(file);
            db[model.name] = model;
            shell.echo(`${module}: ${model.name}`);
          });
      }
    }
    if (files.length) {
      const {db} = config;
      await db.sync()
        .then(({models}) => {
          const seeds = [];
          Object.keys(models).forEach(async name => {
            const model = models[name];
            const count = await model.count();
            const isEmpty = count === 0;
            // Only populate a table with seed data if it is empty
            if (model.seed && isEmpty) {
              seeds.push(model.bulkCreate(model.seed));
            }
          });
          return Promise.all(seeds);
        })
        .catch(() => {});
      Object.keys(db).forEach(modelName => {
        if ("associate" in db[modelName]) db[modelName].associate(db);
      });
    }
  }

  return {files};

};
