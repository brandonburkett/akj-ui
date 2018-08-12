import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Nav from '../../components/nav/nav';

class StandardLayout extends React.PureComponent<RouteComponentProps<any>> {
  // scroll to top on page changes
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  // scroll to top on location change
  componentDidUpdate(prevProps: RouteComponentProps<any>) {
    const { location } = this.props;

    if (location !== prevProps.location) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    const { children } = this.props;

    return (
      <React.Fragment>
        <Nav />
        {children}
      </React.Fragment>
    );
  }
}

export default StandardLayout;
