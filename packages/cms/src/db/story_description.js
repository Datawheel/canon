module.exports = function(sequelize, db) {

  const s = sequelize.define("story_description",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
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

  s.associate = models => {
    s.hasMany(models.story_description_content, {foreignKey: "id", sourceKey: "id", as: "content"});
  };  

  return s;

};
