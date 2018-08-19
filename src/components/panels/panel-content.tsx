import * as React from 'react';

// styles
import './panel-content.css';

/**
 * Info panel content (intended to go inside of panel sections)
 */
const PanelContent: React.StatelessComponent<{}> = ({ children }) => (
  <div className="panel-content">
    <div className="content group">{children}</div>
  </div>
);

export default PanelContent;
