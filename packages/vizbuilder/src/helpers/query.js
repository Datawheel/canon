export function queryBuilder(query, params) {
  let i, item;

  item = params.measures.length;
  for (i = 0; i < item; i++) {
    query = query.measure(params.measures[i]);
  }

  item = params.drillDowns.length;
  for (i = 0; i < item; i++) {
    query = query.drilldown(...params.drillDowns[i]);
  }

  for (i = 0; i < params.cuts.length; i++) {
    item = params.cuts[i];
    if (typeof item !== "string") {
      item = item.values.map(v => `${item.key}.&[${v}]`).join(",");
      if (item.indexOf("],[") > -1) item = `{${item}}`;
    }
    query = query.cut(item);
  }

  item = params.filters.length;
  for (i = 0; i < item; i++) {
    query = query.filter(...params.filters[i]);
  }

  if (params.limit) {
    query = query.pagination(params.limit, params.offset);
  }

  if (params.order) {
    query = query.sorting(params.order, params.orderDesc);
  }

  for (item in params.options) {
    if (params.options.hasOwnProperty(item)) {
      query = query.option(item, params.options[item]);
    }
  }

  return query; // setLangCaptions(query, params.locale);
}
