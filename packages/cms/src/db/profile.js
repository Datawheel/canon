module.exports = function(sequelize, db) {

  const p = sequelize.define("profile",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      slug: {
        type: db.STRING,
        defaultValue: "new-profile-slug"
      },
      ordering: db.INTEGER,
      dimension: db.STRING,
      levels: db.ARRAY(db.TEXT)
    },
    {
      tableName: "canon_cms_profile",
      freezeTableName: true,
      timestamps: false
    }
  );

  p.associate = models => {
    p.hasMany(models.profile_content, {foreignKey: "id", sourceKey: "id", as: "content"});
    p.hasMany(models.topic, {foreignKey: "profile_id", sourceKey: "id", as: "topics"});
    p.hasMany(models.generator, {foreignKey: "profile_id", sourceKey: "id", as: "generators"});
    p.hasMany(models.materializer, {foreignKey: "profile_id", sourceKey: "id", as: "materializers"});
  };

  return p;

};
