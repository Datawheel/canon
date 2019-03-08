module.exports = function(sequelize, db) {

  const s = sequelize.define("story_footnote",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      story_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_story",
          key: "id"
        }
      },
      ordering: db.INTEGER
    }, 
    {
      tableName: "canon_cms_story_footnote",
      freezeTableName: true,
      timestamps: false
    }
  );

  s.associate = models => {
    s.hasMany(models.story_footnote_content, {foreignKey: "id", sourceKey: "id", as: "content"});
  }; 

  return s;

};
