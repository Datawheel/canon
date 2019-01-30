module.exports = function(sequelize, db) {

  const p = sequelize.define("profile_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true
      },
      lang: {
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
      },
      parent_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "profile",
          key: "id"
        }
      }
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return p;

};
