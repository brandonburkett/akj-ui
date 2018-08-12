import * as React from 'react';
import { Route, RouteComponentProps, RouteProps } from 'react-router';
import StandardLayout from './standard-layout';

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
        <StandardLayout
          location={renderProps.location}
          history={renderProps.history}
          match={renderProps.match}
        >
          <Component {...renderProps} />
        </StandardLayout>
      )}
    />
  );
};

export default StandardLayoutRoute;
