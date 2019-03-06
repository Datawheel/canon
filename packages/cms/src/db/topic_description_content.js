module.exports = function(sequelize, db) {

  const t = sequelize.define("topic_description_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "topic_description",
          key: "id"
        }
      },
      lang: {
        type: db.STRING,
        primaryKey: true
      },
      description: {
        type: db.TEXT,
        defaultValue: "New Description"
      }
    }, 
    {
      tableName: "canon_cms_topic_description_content",
      freezeTableName: true,
      timestamps: false
    }
  );

  return t;

};
