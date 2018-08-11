import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './app';

// styles
import './styles/master.css';
import './styles/responsive.css';

import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
