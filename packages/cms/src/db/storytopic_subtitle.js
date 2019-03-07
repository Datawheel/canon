module.exports = function(sequelize, db) {

  const s = sequelize.define("storytopic_subtitle",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      storytopic_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_storytopic",
          key: "id"
        }
      },
      ordering: db.INTEGER
    }, 
    {
      tableName: "canon_cms_storytopic_subtitle",
      freezeTableName: true,
      timestamps: false
    }
  );

  s.associate = models => {
    s.hasMany(models.storytopic_subtitle_content, {foreignKey: "id", sourceKey: "id", as: "content"});
  }; 

  return s;

};
