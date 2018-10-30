module.exports = function(sequelize, db) {

  const s = sequelize.define("selectorsmulti",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      options: {
        type: db.ARRAY(db.JSON),
        defaultValue: []
      },
      default: {
        type: db.ARRAY(db.TEXT),
        defaultValue: []
      },          
      topic_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "topics",
          key: "id"
        }
      },
      title: {
        type: db.STRING,
        defaultValue: "New Selector"
      },
      name: {
        type: db.STRING,
        defaultValue: "newselector"
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
