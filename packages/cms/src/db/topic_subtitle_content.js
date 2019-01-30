module.exports = function(sequelize, db) {

  const t = sequelize.define("topic_subtitle_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "topic_subtitle",
          key: "id"
        }
      },
      lang: {
        type: db.STRING,
        primaryKey: true
      },
      subtitle: {
        type: db.TEXT,
        defaultValue: "New Subtitle"
      }
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return t;

};
