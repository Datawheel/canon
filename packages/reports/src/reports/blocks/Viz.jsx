import React, {useMemo} from "react";

/**
 * "viz" block renderer
*/
export default function Viz({config}) {

  const renderViz = useMemo(() => {
    console.log("test");
    return "test";
  }, [config]);

  return (
    <div>
      imaviz
    </div>
  );
}
