import * as React from 'react';

// styles
import './panel-content.css';

export interface IProps {
  fullViewHeight?: boolean;
}

const defaultProps: Partial<IProps> = {
  fullViewHeight: false,
};

/**
 * Info panel content (intended to go inside of panel sections)
 */
const PanelContent: React.StatelessComponent<IProps> = ({ fullViewHeight, children }) => (
  <div className={`panel-content ${fullViewHeight ? 'full-vh' : ''}`}>
    <div className="content group">{children}</div>
  </div>
);

PanelContent.defaultProps = defaultProps;

export default PanelContent;
