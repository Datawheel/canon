module.exports = function(sequelize, db) {

  const t = sequelize.define("section",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      slug: {
        type: db.STRING,
        defaultValue: ""
      },

      type: {
        type: db.STRING,
        defaultValue: "TextViz"
      },
      ordering: db.INTEGER,
      allowed: {
        type: db.STRING,
        defaultValue: "always"
      },
      heading: {
        type: db.INTEGER,
        default: 1
      },
      position: {
        type: db.STRING,
        defaultValue: "default"
      },
      icon: {
        type: db.STRING,
        defaultValue: ""
      },

      /* relations */
      profile_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_profile",
          key: "id"
        }
      }
    },
    {
      tableName: "canon_cms_section",
      freezeTableName: true,
      timestamps: false
    }
  );

  t.associate = models => {
    t.hasMany(models.section_content, {foreignKey: "id", sourceKey: "id", as: "content"});
    t.hasMany(models.blocks, {foreignKey: "section_id", sourceKey: "id", as: "blocks"});
  };

  return t;

};
