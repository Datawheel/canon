module.exports = function(sequelize, db) {

  const s = sequelize.define("story_description_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "story_description",
          key: "id"
        }
      },
      lang: {
        type: db.STRING,
        primaryKey: true
      },
      description: {
        type: db.TEXT,
        defaultValue: "New Description"
      }
    }, 
    {
      tableName: "canon_cms_story_description_content",
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
