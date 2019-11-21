module.exports = function(sequelize, db) {

  const g = sequelize.define("generator",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: db.TEXT
      },
      api: {
        type: db.TEXT
      },
      description: {
        type: db.TEXT
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
      }
    },
    {
      tableName: "canon_cms_generator",
      freezeTableName: true,
      timestamps: false
    }
  );

  return g;

};
