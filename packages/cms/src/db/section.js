module.exports = function(sequelize, db) {

  const t = sequelize.define("section",
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
      },
      position: {
        type: db.STRING,
        defaultValue: "default"
      },
      icon: {
        type: db.STRING,
        defaultValue: ""
      }
    }, 
    {
      tableName: "canon_cms_section",
      freezeTableName: true,
      timestamps: false
    }
  );

  t.associate = models => {
    t.hasMany(models.section_content, {foreignKey: "id", sourceKey: "id", as: "content"});
    t.hasMany(models.section_visualization, {foreignKey: "section_id", sourceKey: "id", as: "visualizations"});
    t.hasMany(models.section_stat, {foreignKey: "section_id", sourceKey: "id", as: "stats"});
    t.hasMany(models.section_subtitle, {foreignKey: "section_id", sourceKey: "id", as: "subtitles"});
    t.hasMany(models.section_description, {foreignKey: "section_id", sourceKey: "id", as: "descriptions"});
    t.belongsToMany(models.selector, {through: "section_selector", foreignKey: "section_id", otherKey: "selector_id", as: "selectors"});
  };

  return t;

};
