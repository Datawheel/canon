import sequelize from "sequelize";

export as namespace Canon;

interface Config {
  db: Array<DatabaseParamsConfig | DatabaseConnectionConfig>
}

interface DatabaseParamsConfig {
  engine?: "postgresql";
  port?: number;
  host: string;
  name: string;
  pass: string;
  user: string;
  tables: Array<string | ExportedDatabaseModels | DatabaseModelFactory>;
  sequelizeOptions: sequelize.Options;
}

interface DatabaseConnectionConfig {
  connection: string;
  tables: Array<string | ExportedDatabaseModels | DatabaseModelFactory>;
  sequelizeOptions: sequelize.Options;
}

interface ExportedDatabaseModels {
  modelPaths: Record<string, string>;
}

interface DatabaseModelFactory {
  (sequelize: sequelize.Sequelize, dataTypes: sequelize.DataTypes): sequelize.Model<any, any, any>;
}
