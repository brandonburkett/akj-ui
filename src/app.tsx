import * as React from 'react';
import { BrowserRouter, Redirect, Switch } from 'react-router-dom';

// layouts
import StandardLayoutRoute from './containers/layouts/standard-layout-route';

// page containers
import Home from './containers/home/home';
import Iaijutsu from './containers/iaijutsu/iaijutsu';
import Naginatajutsu from './containers/naginatajutsu/naginatajutsu';
import Schedule from './containers/schedule/schedule';
import Seminars from './containers/seminars/seminars';

// 404
import NoMatch from './containers/no-match/no-match';

/**
 * Application routes
 */
const App: React.FunctionComponent = () => (
  <BrowserRouter>
    <Switch>
      <StandardLayoutRoute exact={true} path="/" component={Home} />
      <StandardLayoutRoute exact={true} strict={true} path="/iaijutsu" component={Iaijutsu} />
      <StandardLayoutRoute
        exact={true}
        strict={true}
        path="/naginatajutsu"
        component={Naginatajutsu}
      />
      <StandardLayoutRoute exact={true} strict={true} path="/schedule" component={Schedule} />
      <StandardLayoutRoute exact={true} strict={true} path="/seminars" component={Seminars} />

      {/* redirects */}
      <Redirect to="/seminars" from="/tokai" />

      {/* 404 */}
      <StandardLayoutRoute component={NoMatch} />
    </Switch>
  </BrowserRouter>
);

export default App;
