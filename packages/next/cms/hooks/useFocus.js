import {useCallback, useRef} from "react";

const useFocus = () => {
  const htmlElRef = useRef(null);
  const setFocus = useCallback(() => {
    if (htmlElRef.current) htmlElRef.current.focus();
  }, []);

  return [htmlElRef, setFocus];
};

export {useFocus};
