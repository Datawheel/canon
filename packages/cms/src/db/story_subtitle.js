module.exports = function(sequelize, db) {

  const s = sequelize.define("story_subtitle",
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
