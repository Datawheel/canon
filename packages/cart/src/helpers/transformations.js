/** Java’s String.hashCode() method implemented in Javascript. */
export const getHashCode = s => {
  let h;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }
  return h;
};

/** TODO: generate human title from query */
export const getHumanTitle = s => `Title ${s}`;
