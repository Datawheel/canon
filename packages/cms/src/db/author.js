module.exports = function(sequelize, db) {

  const a = sequelize.define("author",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      story_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "story",
          key: "id"
        }
      },
      ordering: db.INTEGER
    }, 
    {
      tableName: "canon_cms_author",
      freezeTableName: true,
      timestamps: false
    }
  );

  a.associate = models => {
    a.hasMany(models.author_content, {foreignKey: "id", sourceKey: "id", as: "content"});
  };

  return a;

};
