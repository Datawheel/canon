import {SECTION_TYPES} from "../utils/consts/cms";

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

      /* metadata */
      settings: {
        type: db.JSON,
        defaultValue: {}
      },
      type: {
        type: db.STRING,
        defaultValue: SECTION_TYPES.DEFAULT
      },
      heading: {
        type: db.INTEGER,
        default: 1
      },
      ordering: db.INTEGER,

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
