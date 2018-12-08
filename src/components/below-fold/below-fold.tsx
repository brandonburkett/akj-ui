import * as React from 'react';

// styles
import './below-fold.css';

/**
 * Below fold (most likely for main components)
 */
const BelowFold: React.FunctionComponent<React.HTMLAttributes<HTMLDivElement>> = (props, ref) => {
  const { children, ...rest } = props;

  return (
    <div className="below-fold group" ref={ref} {...rest}>
      {children}
    </div>
  );
};

export default React.forwardRef(BelowFold);
