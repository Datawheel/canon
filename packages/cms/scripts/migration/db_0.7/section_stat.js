module.exports = function(sequelize, db) {

  const s = sequelize.define("section_stat",
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
      tableName: "canon_cms_section_stat",
      freezeTableName: true,
      timestamps: false
    }
  );

  s.associate = models => {
    s.hasMany(models.section_stat_content, {foreignKey: "id", sourceKey: "id", as: "content"});
  };

  return s;

};
