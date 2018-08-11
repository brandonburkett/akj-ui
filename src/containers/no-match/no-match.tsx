import React from 'react';
import Head from '../../components/head/head';

export interface IProps {
  location: {
    pathname: string;
  };
}

const NoMatch = (props: IProps) => (
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
              <p>&nbsp;</p>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonial" className="group">
        <div className="quote">
          <p>
            &ldquo;The most difficult rival you will ever face is yourself.&rdquo; - Sekiguchi Komei
            sensei
          </p>
        </div>
      </section>
    </div>
  </React.Fragment>
);

export default NoMatch;
