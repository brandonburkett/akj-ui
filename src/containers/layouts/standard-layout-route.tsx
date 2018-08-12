import * as React from 'react';
import { Route, RouteComponentProps, RouteProps } from 'react-router';
import Nav from '../../components/nav/nav';

/**
 * Standard Layout with drop down nav
 */
const StandardLayoutRoute: React.StatelessComponent<RouteProps> = ({
  component: Component,
  ...props
}) => {
  if (!Component) {
    return null;
  }

  return (
    <Route
      {...props}
      render={(renderProps: RouteComponentProps<any>) => (
        <React.Fragment>
          <Nav />
          <Component {...renderProps} />
        </React.Fragment>
      )}
    />
  );
};

export default StandardLayoutRoute;
