/**
 * Removes ordered list wrapper tags from a string.
 */
function stripOL(n) {
    return n.replace(/<ol>/g, "").replace(/<\/ol>/g, "");
  }

  export default stripOL;
