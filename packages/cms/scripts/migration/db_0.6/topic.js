module.exports = function(sequelize, db) {

  const t = sequelize.define("topic",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      slug: {
        type: db.STRING,
        defaultValue: "new-topic-slug"
      },
      profile_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_profile",
          key: "id"
        }
      },
      type: {
        type: db.STRING,
        defaultValue: "TextViz"
      }, 
      ordering: db.INTEGER,
      allowed: {
        type: db.STRING,
        defaultValue: "always"
      }
    }, 
    {
      tableName: "canon_cms_topic",
      freezeTableName: true,
      timestamps: false
    }
  );

  t.associate = models => {
    t.hasMany(models.topic_content, {foreignKey: "id", sourceKey: "id", as: "content"});
    t.hasMany(models.topic_visualization, {foreignKey: "topic_id", sourceKey: "id", as: "visualizations"});
    t.hasMany(models.topic_stat, {foreignKey: "topic_id", sourceKey: "id", as: "stats"});
    t.hasMany(models.topic_subtitle, {foreignKey: "topic_id", sourceKey: "id", as: "subtitles"});
    t.hasMany(models.topic_description, {foreignKey: "topic_id", sourceKey: "id", as: "descriptions"});
    t.hasMany(models.selector, {foreignKey: "topic_id", sourceKey: "id", as: "selectors"});
  };

  return t;

};
