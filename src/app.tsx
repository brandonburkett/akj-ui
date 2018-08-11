import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

// page containers
// import Home from 'containers/home/home';
import NoMatch from './containers/no-match/no-match';

/**
 * Application routes
 * @returns {*}
 * @constructor
 */
const App = () => (
  <BrowserRouter>
    <Switch>
      {/*<Route exact path="/" component={Home}/>*/}
      <Route component={NoMatch} />
    </Switch>
  </BrowserRouter>
);

export default App;
