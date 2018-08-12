import * as React from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';

// layouts
import StandardLayoutRoute from './containers/layouts/standard-layout-route';

// page containers
// import Home from 'containers/home/home';
import NoMatch from './containers/no-match/no-match';

/**
 * Application routes
 */
const App: React.StatelessComponent = () => (
  <BrowserRouter>
    <Switch>
      {/*<Route exact path="/" component={Home}/>*/}
      <StandardLayoutRoute component={NoMatch} />
    </Switch>
  </BrowserRouter>
);

export default App;
