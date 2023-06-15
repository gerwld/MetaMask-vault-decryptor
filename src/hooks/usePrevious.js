import React, { useEffect, useRef } from 'react';

//Hook for state, saves previous value
function usePrevious(value) {
 const ref = useRef();
 useEffect(() => {
  ref.current = value;
 });
 return ref.current;
}

export default usePrevious;
