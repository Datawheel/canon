import {useRef} from "react";

const useFocus = () => {
  const htmlElRef = useRef(null);
  const setFocus = () => {
    if (htmlElRef.current) htmlElRef.current.focus();
  };

  return [htmlElRef, setFocus];
};

export {useFocus};
