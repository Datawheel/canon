module.exports = function(sequelize, db) {

  const s = sequelize.define("story_description",
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
          model: "story",
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
