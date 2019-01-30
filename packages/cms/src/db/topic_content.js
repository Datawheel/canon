module.exports = function(sequelize, db) {

  const t = sequelize.define("topic_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true
      },
      lang: {
        type: db.STRING,
        primaryKey: true
      },
      title: {
        type: db.STRING,
        defaultValue: "New Topic"
      },      
      parent_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "topic",
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
