module.exports = function(sequelize, db) {

  const s = sequelize.define("story",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: db.STRING,
        defaultValue: "New Story"
      },
      subtitle: {
        type: db.TEXT,
        defaultValue: "New Subtitle"
      },
      image: {
        type: db.STRING,
        defaultValue: "New Image"
      }, 
      ordering: db.INTEGER,
      slug: {
        type: db.STRING,
        defaultValue: "new-story-slug"
      },
      date: {
        type: db.DATE,
        defaultValue: "2018-01-01 00:00:00"
      }
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  s.associate = models => {
    // s.belongsToMany(models.authors, {through: "stories_authors", foreignKey: "story_id", otherKey: "author_id", as: "authors"});
    s.hasMany(models.author, {foreignKey: "story_id", sourceKey: "id", as: "authors"});
    s.hasMany(models.story_footnote, {foreignKey: "story_id", sourceKey: "id", as: "footnotes"});
    s.hasMany(models.story_description, {foreignKey: "story_id", sourceKey: "id", as: "descriptions"});
    s.hasMany(models.storytopic, {foreignKey: "story_id", sourceKey: "id", as: "storytopics"});
  };  

  return s;

};
