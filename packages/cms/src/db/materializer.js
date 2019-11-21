module.exports = function(sequelize, db) {

  const m = sequelize.define("materializer",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: db.TEXT
      },
      description: {
        type: db.TEXT
      },
      logic: {
        type: db.TEXT,
        defaultValue: "return {}"
      },
      ordering: db.INTEGER,
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
      tableName: "canon_cms_materializer",
      freezeTableName: true,
      timestamps: false
    }
  );

  return m;

};
