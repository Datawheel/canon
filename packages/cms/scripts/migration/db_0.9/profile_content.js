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
        type: db.STRING,
        defaultValue: "New Profile"
      },
      subtitle: {
        type: db.TEXT,
        defaultValue: "New Subtitle"
      },
      label: {
        type: db.STRING,
        defaultValue: "New Profile Label"
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
