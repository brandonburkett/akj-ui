import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './app';

// styles
import './styles/master.css';
import './styles/responsive.css';

// polyfills
import smoothscroll from 'smoothscroll-polyfill';

import register from './registerServiceWorker';

smoothscroll.polyfill();

const rootElement = document.getElementById('root') as HTMLElement;
if (rootElement.hasChildNodes()) {
  ReactDOM.hydrate(<App />, rootElement);
} else {
  ReactDOM.render(<App />, rootElement);
}

register();
