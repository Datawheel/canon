module.exports = function(sequelize, db) {

  const b = sequelize.define("generator_batch",
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
      description: {
        type: db.TEXT,
        defaultValue: ""
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
      ordering: db.INTEGER
    },
    {
      tableName: "canon_cms_generator_batch",
      freezeTableName: true,
      timestamps: false
    }
  );

  return g;

};
