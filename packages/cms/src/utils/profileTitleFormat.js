import {titleCase} from "d3plus-text";
const lowercase = ["a", "an", "and", "as", "at", "but", "by", "for", "from", "if", "in", "into", "near", "nor", "of", "on", "onto", "or", "per", "that", "the", "to", "with", "via", "vs", "vs."];
const uppercase = ["CEO", "CFO", "CNC", "COO", "CPU", "GDP", "HVAC", "ID", "IT", "R&D", "TV", "UI"];

/** Sanitizes Titles */
export function formatTitle(title) {
  const focusWords = title.length ? title.match(/\w+/g)
    .filter(t => !lowercase.includes(t) && !uppercase.includes(t)) : [];
  const allUppercase = focusWords.every(t => t.toUpperCase() === t);
  const allLowercase = focusWords.every(t => t.toLowerCase() === t);
  if (allLowercase || allUppercase) return titleCase(title);
  return title;
}

/** Creates profile-type titles */
export function formatCategory(data) {
  return data[0].map(d => {
    let slug = d.slug;
    const dim = d.memberDimension;
    if (data[0].length === 1 && dim.toLowerCase() !== slug.toLowerCase()) {
      if (slug && slug.match(/[A-z]{1,}/g).join("").length < 4) {
        slug = slug.toUpperCase();
      }
      else slug = titleCase(slug);
      return `${dim} (${slug})`;
    }
    return dim;
  }).join("/");
}
