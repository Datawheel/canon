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
