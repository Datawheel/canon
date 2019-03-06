module.exports = function(sequelize, db) {

  const t = sequelize.define("topic_subtitle",
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
          model: "topic",
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
      tableName: "canon_cms_topic_subtitle",
      freezeTableName: true,
      timestamps: false
    }
  );

  t.associate = models => {
    t.hasMany(models.topic_subtitle_content, {foreignKey: "id", sourceKey: "id", as: "content"});
  };

  return t;

};
