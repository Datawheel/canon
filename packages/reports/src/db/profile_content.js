module.exports = function(sequelize, db) {

  const p = sequelize.define("profile_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "canon_cms_profile",
          key: "id"
        }
      },
      locale: {
        type: db.STRING,
        primaryKey: true
      },
      content: {
        type: db.JSON,
        defaultValue: {}
      }
    },
    {
      tableName: "canon_cms_profile_content",
      freezeTableName: true,
      timestamps: false
    }
  );

  return p;

};
