module.exports = function(sequelize, db) {

  const s = sequelize.define("storytopic",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },    
      slug: {
        type: db.STRING,
        defaultValue: "new-storytopic-slug"
      },
      story_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "story",
          key: "id"
        }
      },
      type: {
        type: db.STRING,
        defaultValue: "TextViz"
      },
      ordering: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  s.associate = models => {
    s.hasMany(models.storytopic_content, {foreignKey: "id", sourceKey: "id", as: "content"});
    s.hasMany(models.storytopic_description, {foreignKey: "storytopic_id", sourceKey: "id", as: "descriptions"});
    s.hasMany(models.storytopic_stat, {foreignKey: "storytopic_id", sourceKey: "id", as: "stats"});
    s.hasMany(models.storytopic_subtitle, {foreignKey: "storytopic_id", sourceKey: "id", as: "subtitles"});
    s.hasMany(models.storytopic_visualization, {foreignKey: "storytopic_id", sourceKey: "id", as: "visualizations"});
  };  

  return s;

};
