module.exports = function(sequelize, db) {

  const s = sequelize.define("story_selector",
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
      story_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_story",
          key: "id"
        }
      },
      title: {
        type: db.STRING,
        defaultValue: ""
      },
      name: {
        type: db.STRING,
        defaultValue: ""
      },
      type: {
        type: db.STRING,
        defaultValue: "single"
      },
      dynamic: {
        type: db.TEXT,
        defaultValue: ""
      }
    },
    {
      tableName: "canon_cms_story_selector",
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
