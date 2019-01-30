module.exports = function(sequelize, db) {

  const t = sequelize.define("topic_subtitle_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true
      },
      lang: {
        type: db.STRING,
        primaryKey: true
      },
      subtitle: {
        type: db.TEXT,
        defaultValue: "New Subtitle"
      },      
      parent_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "topic_subtitle",
          key: "id"
        }
      }
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return t;

};
