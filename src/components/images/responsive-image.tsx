import React, { ImgHTMLAttributes, StatelessComponent } from 'react';

// styles
import './responsive-image.css';

/**
 * Width 100% images
 */
const ResponsiveImage: StatelessComponent<ImgHTMLAttributes<HTMLImageElement>> = props => (
  <img className="fit-img" {...props} />
);

export default ResponsiveImage;
