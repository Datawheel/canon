module.exports = function(sequelize, db) {

  const s = sequelize.define("topic_stat",
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
      tableName: "canon_cms_topic_stat",
      freezeTableName: true,
      timestamps: false
    }
  );

  s.associate = models => {
    s.hasMany(models.topic_stat_content, {foreignKey: "id", sourceKey: "id", as: "content"});
  };

  return s;

};
