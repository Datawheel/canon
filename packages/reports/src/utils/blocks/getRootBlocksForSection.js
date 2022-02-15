/**
 * Given a section, find all its root blocks, i.e., ones with no inputs, to use as a starting point for running a section
 * 1. blocks in this section that have no inputs
 * 2. blocks in this section that have inputs entirely consisting of shared / global blocks.
 * @param {*} sid 
 * @param {*} blocks 
 */
module.exports = (sid, blocks) => {
  const nonNativeBlocks = Object.values(blocks).filter(d => d.shared && d.section_id !== sid).map(d => d.id);
  return Object.values(blocks)
    .filter(d => d.section_id === sid && (d.inputs.length === 0 || d.inputs.length > 0 && d.inputs.every(i => nonNativeBlocks.includes(i))))
    .reduce((acc, d) => ({...acc, [d.id]: d}), {});
};
