import React, { HTMLAttributes, StatelessComponent } from 'react';

// styles
import './responsive-map.css';

/**
 * Width 100% map
 */
const ResponsiveMap: StatelessComponent<HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...rest
}) => (
  <div className="fit-map" {...rest}>
    {children}
  </div>
);

export default ResponsiveMap;
