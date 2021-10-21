import {BLOCK_TYPES} from "../utils/consts/cms";

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
        defaultValue: BLOCK_TYPES.TEXT
      },
      heading: {
        type: db.INTEGER,
        default: 1
      },
      shared: {
        type: db.BOOLEAN,
        default: false
      },
      ordering: db.INTEGER,

      /* generators & vizes */
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
      logicSimpleEnabled: {
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
