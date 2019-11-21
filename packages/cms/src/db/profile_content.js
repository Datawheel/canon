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
      title: {
        type: db.STRING
      },
      subtitle: {
        type: db.TEXT
      },
      label: {
        type: db.STRING
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
