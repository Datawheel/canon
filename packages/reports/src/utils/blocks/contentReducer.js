/**
 * Content comes through sequelize as arrays:
 * content: [{id: 1, locale: "es", content: "hello"}, {id: 1, locale:"es", content:"hola"}
 * We often would rather these were in a language lookup:
 * content: {en: {...}, es: {...}}
 * This method does that.
 */

module.exports = (acc, d) => ({...acc, [d.locale]: d});
