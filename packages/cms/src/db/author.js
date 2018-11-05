module.exports = function(sequelize, db) {

  const a = sequelize.define("author",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: db.STRING, 
        defaultValue: "New Author"
      },
      title: {
        type: db.STRING, 
        defaultValue: "New Title"
      },
      image: {
        type: db.STRING, 
        defaultValue: "New Image"
      },
      twitter: {
        type: db.STRING, 
        defaultValue: "New Twitter"
      },
      story_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "story",
          key: "id"
        }
      },
      ordering: db.INTEGER,
      bio: {
        type: db.TEXT, 
        defaultValue: "New Bio"
      }
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return a;

};
