import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './app';

it('renders without crashing', () => {
  // mocks
  window.scrollTo = () => {
    /*stub*/
  };

  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
