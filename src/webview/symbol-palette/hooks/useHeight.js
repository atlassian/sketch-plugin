import { useState, useCallback } from 'react';

const useHeight = (dependencies = []) => {
  const [height, setHeight] = useState(0);
  const ref = useCallback(node => {
    if (node !== null) {
      setHeight(node.scrollHeight);
    }
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
  return [height, ref];
};

export default useHeight;
