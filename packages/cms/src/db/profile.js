module.exports = function(sequelize, db) {

  const p = sequelize.define("profile",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ordering: db.INTEGER
    },
    {
      tableName: "canon_cms_profile",
      freezeTableName: true,
      timestamps: false
    }
  );

  p.associate = models => {
    p.hasMany(models.profile_meta, {foreignKey: "profile_id", sourceKey: "id", as: "meta"});
    p.hasMany(models.profile_content, {foreignKey: "id", sourceKey: "id", as: "content"});
    p.hasMany(models.topic, {foreignKey: "profile_id", sourceKey: "id", as: "topics"});
    p.hasMany(models.generator, {foreignKey: "profile_id", sourceKey: "id", as: "generators"});
    p.hasMany(models.materializer, {foreignKey: "profile_id", sourceKey: "id", as: "materializers"});
    p.hasMany(models.selector, {foreignKey: "profile_id", sourceKey: "id", as: "selectors"});
  };

  return p;

};
