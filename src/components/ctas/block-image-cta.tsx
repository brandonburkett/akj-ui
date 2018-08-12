import React, { StatelessComponent } from 'react';
import { Link } from 'react-router-dom';

// styles
import './block-image-cta.css';

// images
import imgMore from './images/more.png';

export interface IProps {
  to: string;
  title?: string;
  content?: string;
  imgSrc: string;
  imgAlt: string;
}

const defaultProps: Partial<IProps> = {
  content: '',
  title: '',
};

/**
 * Block call to action link.
 * TODO: support outgoing links w/ target blank
 */
const BlockImageCTA: StatelessComponent<IProps> = ({
  to,
  imgSrc,
  imgAlt,
  title,
  content,
  children,
}) => (
  <Link className="block-image-cta" to={to}>
    <img className="fit-img" src={imgSrc} alt={imgAlt} />
    <div className="block-image-info">
      <div className="black-image-title">{title}</div>
      <div className="block-image-details">{content}</div>
      <div className="block-image-icon">
        <img src={imgMore} alt="Read More" />
      </div>
    </div>
    {children}
  </Link>
);

BlockImageCTA.defaultProps = defaultProps;

export default BlockImageCTA;
