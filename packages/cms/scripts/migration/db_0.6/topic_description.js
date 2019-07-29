module.exports = function(sequelize, db) {

  const t = sequelize.define("topic_description",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },     
      topic_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_topic",
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
      tableName: "canon_cms_topic_description",
      freezeTableName: true,
      timestamps: false
    }
  );

  t.associate = models => {
    t.hasMany(models.topic_description_content, {foreignKey: "id", sourceKey: "id", as: "content"});
  };

  return t;

};
