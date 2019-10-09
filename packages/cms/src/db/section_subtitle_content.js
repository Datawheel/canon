module.exports = function(sequelize, db) {

  const t = sequelize.define("section_subtitle_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "canon_cms_section_subtitle",
          key: "id"
        }
      },
      locale: {
        type: db.STRING,
        primaryKey: true
      },
      subtitle: {
        type: db.TEXT,
        defaultValue: "New Subtitle"
      }
    }, 
    {
      tableName: "canon_cms_section_subtitle_content",
      freezeTableName: true,
      timestamps: false
    }
  );

  return t;

};
