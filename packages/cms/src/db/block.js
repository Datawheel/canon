import {SECTION_TYPES} from "../utils/cms";

module.exports = function(sequelize, db) {

  return sequelize.define("block",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      /* block metadata */
      name: {
        type: db.TEXT,
        defaultValue: ""
      },
      description: {
        type: db.TEXT,
        defaultValue: ""
      },
      type: {
        type: db.STRING,
        defaultValue: SECTION_TYPES.TEXT
      },
      allowed: {
        type: db.STRING,
        defaultValue: "always"
      },

      /* generators */
      api: {
        type: db.TEXT,
        defaultValue: ""
      },
      logic: {
        type: db.TEXT,
        defaultValue: "return {}"
      },
      logic_simple: {
        type: db.JSON,
        defaultValue: null
      },
      simple: {
        type: db.BOOLEAN,
        defaultValue: true
      },

      /* relations */
      section_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_section",
          key: "id"
        }
      }
    },
    {
      tableName: "canon_cms_block",
      freezeTableName: true,
      timestamps: false
    }
  );

};
