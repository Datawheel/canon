module.exports = function(sequelize, db) {

  const s = sequelize.define("section",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: db.STRING,
        defaultValue: "New Section"
      },      
      slug: {
        type: db.STRING,
        defaultValue: "new-section-slug"
      },
      profile_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "profile",
          key: "id"
        }
      },
      ordering: db.INTEGER,
      allowed: {
        type: db.STRING,
        defaultValue: "always"
      }
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  s.associate = models => {
    s.hasMany(models.topic, {foreignKey: "section_id", sourceKey: "id", as: "topics"});
    s.hasMany(models.section_subtitle, {foreignKey: "section_id", sourceKey: "id", as: "subtitles"});
    s.hasMany(models.section_description, {foreignKey: "section_id", sourceKey: "id", as: "descriptions"});
  };

  return s;

};
