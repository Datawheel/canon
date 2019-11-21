module.exports = function(sequelize, db) {

  const s = sequelize.define("selector",
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
        type: db.TEXT,
        defaultValue: ""
      },          
      profile_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_profile",
          key: "id"
        }
      },
      title: {
        type: db.STRING
      },
      name: {
        type: db.STRING
      },
      type: {
        type: db.STRING,
        defaultValue: "single"
      }
    }, 
    {
      tableName: "canon_cms_selector",
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
