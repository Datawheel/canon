module.exports = meta => 
  meta.reduce((acc, d) => {
    if (!acc[d.ordering]) acc[d.ordering] = [];
    acc[d.ordering].push(d);
    return acc;
  }, []);
