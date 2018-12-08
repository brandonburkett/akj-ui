import * as React from 'react';

// styles
import './panel-section.css';

export interface IProps {
  color?: 'olive' | 'cream';
}

const defaultProps: Partial<IProps> = {
  color: 'olive',
};

/**
 * Info panels with color selection
 */
const PanelSection: React.FunctionComponent<IProps> = ({ color, children }) => {
  return (
    <section className={`info-panel-details info-panel-${color} translate-z`}>{children}</section>
  );
};

PanelSection.defaultProps = defaultProps;

export default PanelSection;
