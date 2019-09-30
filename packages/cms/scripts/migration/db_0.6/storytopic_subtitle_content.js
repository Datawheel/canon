module.exports = function(sequelize, db) {

  const s = sequelize.define("storytopic_subtitle_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "canon_cms_storytopic_subtitle",
          key: "id"
        }
      },
      lang: {
        type: db.STRING,
        primaryKey: true
      },
      subtitle: {
        type: db.TEXT,
        defaultValue: "New Subtitle"
      }
    }, 
    {
      tableName: "canon_cms_storytopic_subtitle_content",
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
