import * as React from 'react';
import Head from '../../components/head/head';
import Quote from '../../components/quote/quote';

export interface IProps {
  location: {
    pathname: string;
  };
}

const NoMatch: React.StatelessComponent<IProps> = props => (
  <React.Fragment>
    <Head
      title="Not Found"
      desc="Page not found really long desc would go here to seee what happens"
      path={props.location.pathname}
    />
    <div id="main" className="group" role="main">
      <section id="info_panel" className="info_panel_details">
        <div className="panel_content">
          <div className="content group">
            <div className="cs12">
              <h1>Oops, something went wrong...</h1>
              <p>
                The page you're looking for either doesn't exist or there was an internal error for
                your request.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Quote
        content="The most difficult rival you will ever face is yourself."
        author="Sekiguchi Komei sensei"
      />
    </div>
  </React.Fragment>
);

export default NoMatch;
