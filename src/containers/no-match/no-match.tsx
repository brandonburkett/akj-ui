import * as React from 'react';

// ui
import Head from '../../components/head/head';
import PanelContent from '../../components/panels/panel-content';
import PanelSection from '../../components/panels/panel-section';
import Quote from '../../components/quote/quote';
import Footer from '../../components/footer/footer';

export interface IProps {
  location: {
    pathname: string;
  };
}

/**
 * 404 page
 */
const NoMatch: React.FunctionComponent<IProps> = props => (
  <React.Fragment>
    <Head title="404 Not Found" desc="Page not found." path={props.location.pathname} />
    <div id="main" className="group" role="main">
      <PanelSection>
        <PanelContent fullViewHeight={true}>
          <div className="cs12">
            <h1>Oops, something went wrong...</h1>
            <p>
              The page you're looking for either doesn't exist or there was an internal error for
              your request.
            </p>
          </div>
        </PanelContent>
      </PanelSection>
      <Quote
        content="The most difficult rival you will ever face is yourself."
        author="Sekiguchi Komei sensei"
      />
      <Footer />
    </div>
  </React.Fragment>
);

export default NoMatch;
