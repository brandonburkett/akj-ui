import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './app';

// styles
import './styles/master.css';
import './styles/responsive.css';

// TODO: enable service worker
// import registerServiceWorker from './registerServiceWorker';

const rootElement = document.getElementById('root') as HTMLElement;
if (rootElement.hasChildNodes()) {
  ReactDOM.hydrate(<App />, rootElement);
} else {
  ReactDOM.render(<App />, rootElement);
}

// TODO: enable service worker
// registerServiceWorker();
