module.exports = function(sequelize, db) {

  const s = sequelize.define("stories_descriptions",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      description: {
        type: db.TEXT,
        defaultValue: "New Description"
      },       
      story_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "stories",
          key: "id"
        }
      },
      ordering: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
