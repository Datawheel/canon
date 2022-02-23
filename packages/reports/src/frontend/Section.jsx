/* react */
import React from "react";

/** type-specific render components */
import TypeRenderers from "../reports/blocks/types/renderers";

/**
 *
 */
function Section({content}) {

  const {blocks} = content;

  return (
    <div className="cms-section-content">
      {blocks.map(block => {
        const Renderer = TypeRenderers[block.type];
        return <Renderer key={block.id} {...block.renderContent} />;
      })}
    </div>
  );

}

export default Section;
