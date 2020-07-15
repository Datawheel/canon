import {Comparison as SymbolComparison, Format} from "@datawheel/olap-client";
import {Comparison} from "./enums";
import {isValidCut, isValidFilter, isValidGroup} from "./validation";

const comparisonMap = {
  [Comparison.EQ]: SymbolComparison.eq,
  [Comparison.NEQ]: SymbolComparison.neq,
  [Comparison.GT]: SymbolComparison.gt,
  [Comparison.GTE]: SymbolComparison.gte,
  [Comparison.LT]: SymbolComparison.lt,
  [Comparison.LTE]: SymbolComparison.lte
};

/**
 * Inserts the values of the internal queryState into a olap-client Query object.
 * @param {import("@datawheel/olap-client").Query} query
 * @param {object} pmsr
 * @param {MeasureItem | undefined} [pmsr.collection]
 * @param {FilterItem[]} pmsr.filters
 * @param {MeasureItem | undefined} [pmsr.lci]
 * @param {MeasureItem} pmsr.measure
 * @param {MeasureItem | undefined} [pmsr.moe]
 * @param {MeasureItem | undefined} [pmsr.source]
 * @param {MeasureItem | undefined} [pmsr.uci]
 * @param {object} pdrill
 * @param {GroupItem[]} pdrill.groups
 * @param {LevelItem | undefined} [pdrill.timeLevel]
 */
export function queryBuilder(
  query,
  {collection, filters, lci, measure, moe, source, uci},
  {groups, timeLevel}
) {
  query
    .addMeasure(measure.name)
    .setFormat(Format.jsonrecords)
    .setOption("nonempty", true)
    .setOption("parents", true)
    .setOption("sparse", true)
    .setSorting(measure.name, true);

  moe && query.addMeasure(moe.name);
  lci && query.addMeasure(lci.name);
  uci && query.addMeasure(uci.name);
  source && query.addMeasure(source.name);
  collection && query.addMeasure(collection.name);

  timeLevel && query.addDrilldown(timeLevel.name);

  for (let i = 0; i < groups.length; i++) {
    const item = groups[i];
    isValidGroup(item) && query.addDrilldown(item);
    isValidCut(item) && query.addCut(item, item.members);
  }

  for (let i = 0; i < filters.length; i++) {
    const item = filters[i];
    isValidFilter(item) &&
      query.addFilter(item.measure, comparisonMap[item.operator], item.interpretedValue);
  }

  return query;
}
