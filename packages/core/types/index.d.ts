import sequelize from "sequelize";

export as namespace Canon;

interface Config {
  db: (DatabaseParamsConfig | DatabaseConnectionConfig)[]
}

interface DatabaseParamsConfig {
  engine?: "postgresql";
  port?: number;
  host: string;
  name: string;
  pass: string;
  user: string;
  tables: (string | DatabaseModelFactory)[];
  sequelizeOptions: sequelize.Options;
}

interface DatabaseConnectionConfig {
  connection: string;
  tables: (string | DatabaseModelFactory)[];
  sequelizeOptions: sequelize.Options;
}

interface DatabaseModelFactory {
  (sequelize: sequelize.Sequelize, dataTypes: sequelize.DataTypes): sequelize.Model<any, any, any>;
}
