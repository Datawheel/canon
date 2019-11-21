module.exports = function(sequelize, db) {

  const s = sequelize.define("storysection",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },    
      slug: {
        type: db.STRING,
        defaultValue: ""
      },
      story_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_story",
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
      tableName: "canon_cms_storysection",
      freezeTableName: true,
      timestamps: false
    }
  );

  s.associate = models => {
    s.hasMany(models.storysection_content, {foreignKey: "id", sourceKey: "id", as: "content"});
    s.hasMany(models.storysection_description, {foreignKey: "storysection_id", sourceKey: "id", as: "descriptions"});
    s.hasMany(models.storysection_stat, {foreignKey: "storysection_id", sourceKey: "id", as: "stats"});
    s.hasMany(models.storysection_subtitle, {foreignKey: "storysection_id", sourceKey: "id", as: "subtitles"});
    s.hasMany(models.storysection_visualization, {foreignKey: "storysection_id", sourceKey: "id", as: "visualizations"});
  };  

  return s;

};
