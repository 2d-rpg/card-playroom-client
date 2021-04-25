import React from "react";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useValueRef<T>(val: T) {
  const ref = React.useRef(val);
  React.useEffect(() => {
    ref.current = val;
  }, [val]);
  return ref;
}
