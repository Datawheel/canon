module.exports = function(sequelize, db) {

  const s = sequelize.define("storysection_stat",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      storysection_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_storysection",
          key: "id"
        }
      },
      ordering: db.INTEGER
    }, 
    {
      tableName: "canon_cms_storysection_stat",
      freezeTableName: true,
      timestamps: false
    }
  );

  s.associate = models => {
    s.hasMany(models.storysection_stat_content, {foreignKey: "id", sourceKey: "id", as: "content"});
  }; 

  return s;

};
