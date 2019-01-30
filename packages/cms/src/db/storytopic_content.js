module.exports = function(sequelize, db) {

  const s = sequelize.define("storytopic_content",
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
        defaultValue: "New StoryTopic"
      },       
      parent_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "storytopic",
          key: "id"
        }
      }
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );  

  return s;

};
