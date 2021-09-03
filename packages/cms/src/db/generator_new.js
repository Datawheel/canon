module.exports = function(sequelize, db) {

  const g = sequelize.define("generator_new",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: db.TEXT,
        defaultValue: ""
      },
      api: {
        type: db.TEXT,
        defaultValue: ""
      },
      description: {
        type: db.TEXT,
        defaultValue: ""
      },
      logic: {
        type: db.TEXT,
        defaultValue: "return {}"
      },
      logic_simple: {
        type: db.JSON,
        defaultValue: null
      },
      simple: {
        type: db.BOOLEAN,
        defaultValue: true
      },
      profile_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_profile",
          key: "id"
        }
      },
      allowed: {
        type: db.STRING,
        defaultValue: "always"
      },
      batch_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_generator_batch",
          key: "id"
        }
      },
      ordering: db.INTEGER

    },
    {
      tableName: "canon_cms_generator_new",
      freezeTableName: true,
      timestamps: false
    }
  );

  return g;

};
