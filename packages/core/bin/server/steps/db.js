const Sequelize = require("sequelize");
const shell = require("shelljs");

const getConfig = require("../../config");

module.exports = async function(config) {
  const {db: userDBs} = getConfig();

  const watchingFiles = [];

  const connections = await Promise.all(
    Array.from(userDBs, async userDB => {
      const db = {
        engine: "postgresql",
        host: "localhost",
        port: 5432,
        ...userDB
      };

      const connectionUri = "connection" in db
        ? db.connection
        : `${db.engine}://${db.user}:${db.pass}@${db.host}:${db.port}/${db.name}`;
      const maskedConnectionUri = connectionUri.replace(/:\/\/(.+):(.+)@/, (_, user, pass) =>
        `://${user}:${pass.replace(/./g, "*")}@`
      );

      const sequelize = new Sequelize(connectionUri, {
        define: {timestamps: true},
        logging: () => {},
        operatorsAliases: Sequelize.Op,
        ...db.sequelizeOptions
      });

      await sequelize.authenticate().catch(error => {
        shell.echo(`\nDatabase: ${maskedConnectionUri}\n  Can't authenticate to database.`);
        throw error;
      });
      shell.echo(`\nDatabase: ${maskedConnectionUri}\n  Connection successful.`);

      Array.from(db.tables, table => {
        if (typeof table === "string") {
          const model = sequelize.import(table);
          watchingFiles.push(table);
          shell.echo(`  Model "${model.name}" hydrated`);
        }
        else if (typeof table === "function") {
          const model = table(sequelize, Sequelize);
          shell.echo(`  Model "${model.name}" hydrated`);
        }
        else if (typeof table === "object" && table.hasOwnProperty("modelPaths")) {
          const paths = Object.values(table.modelPaths);
          paths.forEach(path => {
            const model = sequelize.import(path);
            shell.echo(`  Model "${model.name}" hydrated`);
          });
          watchingFiles.push(...paths);
        }
      });

      await sequelize.sync();
      const models = Object.values(sequelize.models);

      await Promise.all(
        models.map(async model => {
          if ("seed" in model) {
            const count = await model.count();
            if (count === 0) {
              shell.echo(`  Seeding model "${model.name}"`);
              await model.bulkCreate(model.seed);
            }
          }

          if (typeof model.associate === "function") {
            model.associate(sequelize.models);
          }
        })
      );

      return sequelize;
    })
  ).catch(err => {
    shell.echo(`Problem hydrating database models:\n${err.stack}`);
    process.exit(1);
  });

  const fakeDb = {_connections: [], _models: []};

  for (const conn of connections) {
    fakeDb._connections.push(conn);
    fakeDb._models.push(...Object.values(conn.models));
    Object.assign(fakeDb, conn.models);
  }
  fakeDb.close = () => {
    for (const conn of fakeDb._connections) {
      conn.close();
    }
  };

  config.db = fakeDb;

  return {files: watchingFiles};
};
