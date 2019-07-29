module.exports = function(sequelize, db) {

  const s = sequelize.define("story_footnote",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: db.STRING,
        defaultValue: "New Title"
      },
      description: {
        type: db.TEXT,
        defaultValue: "New Footnote"
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
