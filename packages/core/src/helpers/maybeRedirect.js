/**
 * Helper function for building redirect links. When a cms need returns a canonRedirect key,
 * build a new URL that uses slugs instead of ids and return that URL for 301 redirects (or false, if not)
 */
module.exports = (query, props, initialState) => {
  // Needs may return a special canonRedirect key. If they do so, process a redirect, using the variables provided
  // in those objects as variables to substitute in the routes.
  const redirects = Object.values(initialState.data).filter(d => d.canonRedirect);
  // If the query contains ?redirect=true, a redirect has already occurred. To avoid redirect loops, ensure this value is unset
  if (!query.redirect && redirects.length > 0) {
    // If any needs provided redirect keys, combine them into one object.
    const variables = redirects.reduce((acc, d) => ({...acc, ...d.canonRedirect}), {});
    // Use variables given by the canonRedirect key, but fall back on given params (to cover for unprovided keys, like :lang)
    const params = {...props.params, ...variables};
    // Not sure if this is a reliable way to get which route this is.
    let route = props.routes[1].path;
    // Sort the keys to be "integers first," i.e., slug<int> before slug.
    // This ensures that the swaps are processed "outside-in" (descending), and ":slug" doesn't match INSIDE ":slug2"
    Object.keys(params).sort(a => (/\d/).test(a) ? -1 : 1).forEach(key => {
      route = route.replace(new RegExp(`[(]{0,1}\/:${key}[)]{0,1}`), params[key] ? `/${params[key]}` : "");
    });
    // Pass a ?redirect flag, to avoid a redirect loop
    // return res.redirect(301, `${route}?redirect=true`);
    return `${route}?redirect=true`;
  }
  else return false;
};
