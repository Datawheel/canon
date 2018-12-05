module.exports = function(sequelize, db) {

  const v = sequelize.define("topic_visualization",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      logic: {
        type: db.TEXT,
        defaultValue: "return {}"
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
      logic_simple: {
        type: db.JSON,
        defaultValue: null
      },
      simple: {
        type: db.BOOLEAN,
        defaultValue: false
      },      
      ordering: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return v;

};
