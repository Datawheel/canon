module.exports = function(sequelize, db) {

  const t = sequelize.define("topic_subtitle",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      subtitle: {
        type: db.TEXT,
        defaultValue: "New Subtitle"
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
      freezeTableName: true,
      timestamps: false
    }
  );

  return t;

};
