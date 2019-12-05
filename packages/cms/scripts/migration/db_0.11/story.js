module.exports = function(sequelize, db) {

  const s = sequelize.define("story",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ordering: db.INTEGER,
      slug: {
        type: db.STRING,
        defaultValue: ""
      },
      date: {
        type: db.DATE,
        defaultValue: "2018-01-01 00:00:00"
      }
    }, 
    {
      tableName: "canon_cms_story",
      freezeTableName: true,
      timestamps: false
    }
  );

  s.associate = models => {
    s.hasMany(models.story_content, {foreignKey: "id", sourceKey: "id", as: "content"});
    s.hasMany(models.author, {foreignKey: "story_id", sourceKey: "id", as: "authors"});
    s.hasMany(models.story_footnote, {foreignKey: "story_id", sourceKey: "id", as: "footnotes"});
    s.hasMany(models.story_description, {foreignKey: "story_id", sourceKey: "id", as: "descriptions"});
    s.hasMany(models.storysection, {foreignKey: "story_id", sourceKey: "id", as: "storysections"});
  };  

  return s;

};
