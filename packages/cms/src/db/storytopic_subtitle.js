module.exports = function(sequelize, db) {

  const s = sequelize.define("storytopic_subtitle",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      storytopic_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "storytopic",
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
    s.hasMany(models.storytopic_subtitle_content, {foreignKey: "parent_id", sourceKey: "id", as: "content"});
  }; 

  return s;

};
