module.exports = function(sequelize, db) {

  const s = sequelize.define("story_footnote_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "canon_cms_story_footnote",
          key: "id"
        }
      },
      locale: {
        type: db.STRING,
        primaryKey: true
      },
      title: {
        type: db.STRING,
        defaultValue: ""
      },
      description: {
        type: db.TEXT,
        defaultValue: ""
      }
    }, 
    {
      tableName: "canon_cms_story_footnote_content",
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
