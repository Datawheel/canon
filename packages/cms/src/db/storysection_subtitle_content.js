module.exports = function(sequelize, db) {

  const s = sequelize.define("storysection_subtitle_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "canon_cms_storysection_subtitle",
          key: "id"
        }
      },
      locale: {
        type: db.STRING,
        primaryKey: true
      },
      subtitle: {
        type: db.TEXT
      }
    }, 
    {
      tableName: "canon_cms_storysection_subtitle_content",
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
