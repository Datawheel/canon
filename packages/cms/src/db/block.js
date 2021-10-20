import {SECTION_TYPES} from "../utils/consts/cms";

module.exports = function(sequelize, db) {

  return sequelize.define("block",
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

      /* block metadata */
      settings: {
        type: db.JSON,
        defaultValue: {}
      },
      type: {
        type: db.STRING,
        defaultValue: SECTION_TYPES.TEXT
      },
      allowed: {
        type: db.STRING,
        defaultValue: "always"
      },
      logicAllowed: {
        type: db.STRING,
        defaultValue: "return \"always\";"
      },
      useLogicAllowed: {
        type: db.BOOLEAN,
        defaultValue: false
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
      logicSimple: {
        type: db.JSON,
        defaultValue: null
      },
      useLogicSimple: {
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
