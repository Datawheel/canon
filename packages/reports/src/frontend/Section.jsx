/* react */
import React from "react";

/** type-specific render components */
import TypeRenderers from "../reports/blocks/types/renderers";

import {BLOCK_TYPES} from "../utils/consts/cms";

/**
 *
 */
function Section({content}) {

  const blocks = content.blocks.filter(d => d.type !== BLOCK_TYPES.GENERATOR);

  return (
    <div className="cms-section-content">
      {blocks.map(block => {
        const Renderer = TypeRenderers[block.type];
        // todo1.0 fix this as part of ryan's rewrite
        const payload = block.type === BLOCK_TYPES.SELECTOR ? {config: block.renderContent} : block.renderContent;
        return <Renderer key={block.id} {...payload} />;
      })}
    </div>
  );

}

export default Section;
