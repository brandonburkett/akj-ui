import * as React from 'react';

// styles
import './panel-section.css';

/**
 * Info panels
 */
const PanelSection: React.StatelessComponent<{}> = ({ children }) => (
  <section className="info-panel-details">{children}</section>
);

export default PanelSection;
