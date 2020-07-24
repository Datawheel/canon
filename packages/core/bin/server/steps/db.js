const Sequelize = require("sequelize");
const shell = require("shelljs");

const getConfig = require("../../canonConfig");

module.exports = async function(config) {
  const {db: userDBs} = getConfig();

  const connections = await Promise.all(
    [].concat(userDBs).map(async db => {
      const connectionUri = db.connection ||
        `postgresql://${db.user}:${db.pass}@${db.host || "localhost"}:${db.port || 5432}/${db.name}`;

      const sequelize = new Sequelize(connectionUri, {
        define: {timestamps: true},
        logging: () => {},
        operatorsAliases: Sequelize.Op,
        ...db.sequelizeOptions
      });
      await sequelize.authenticate();
      shell.echo(`\nDatabase: ${connectionUri.replace(/:.+?@/, capture =>
        `:${new Array(capture.length - 1).join("*")}@`
      )}`);

      const tables = [].concat(db.tables);
      for (const table of tables) {
        if (typeof table !== "function") continue;

        const model = table(sequelize, Sequelize);
        shell.echo(`Model "${model.name}" hydrated`);
      }

      await sequelize.sync();
      const models = Object.values(sequelize.models);

      await Promise.all(
        models.map(async model => {
          const count = await model.count();
          if (model.seed && count === 0) {
            shell.echo(`Seeding model "${model.name}"`);
            await model.bulkCreate(model.seed);
          }

          if (typeof model.associate === "function") {
            model.associate(sequelize.models);
          }
        })
      );

      return sequelize;
    })
  ).catch(err => {
    shell.echo(`Problem hydrating database models: ${err.message}`);
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

  return {files: []};
};
