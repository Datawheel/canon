module.exports = function(sequelize, db) {

  const t = sequelize.define("section_subtitle",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },     
      section_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_section",
          key: "id"
        }
      },
      allowed: {
        type: db.STRING,
        defaultValue: "always"
      }, 
      ordering: db.INTEGER
    }, 
    {
      tableName: "canon_cms_section_subtitle",
      freezeTableName: true,
      timestamps: false
    }
  );

  t.associate = models => {
    t.hasMany(models.section_subtitle_content, {foreignKey: "id", sourceKey: "id", as: "content"});
  };

  return t;

};
