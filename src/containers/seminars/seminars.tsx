import * as React from 'react';

// ui
import Head from '../../components/head/head';
import PanelContent from '../../components/panels/panel-content';
import PanelSection from '../../components/panels/panel-section';
import Quote from '../../components/quote/quote';
import ResponsiveMap from '../../components/maps/responsive-map';
import Footer from '../../components/footer/footer';

// props
export interface IProps {
  location: {
    pathname: string;
  };
}

/**
 * seminars page component
 */
const Seminars: React.FunctionComponent<IProps> = props => (
  <React.Fragment>
    <Head
      title="Seminars"
      desc="Iaijutsu seminar information and schedule with Sekiguchi sensei at the Austin Komei Jyuku."
      path={props.location.pathname}
    />
    <div id="main" className="group" role="main">
      <PanelSection>
        {/*<PanelContent>*/}
        {/*  <div className="cs12">*/}
        {/*    <h1>2023 Austin Seminar</h1>*/}
        {/*  </div>*/}
        {/*  <div className="cs12">*/}
        {/*    <p>*/}
        {/*      Details for the 2023 Austin Iaijutsu seminar will be posted soon!*/}
        {/*    </p>*/}
        {/*  </div>*/}
        {/*</PanelContent>*/}
        <PanelContent>
          <div className="cs12">
            <h1>2023 Austin Seminar</h1>
          </div>
          <div className="cs12">
            <p>
              Sekiguchi sensei will be in Austin, TX, teaching a
              Muso Jikiden Eishin-ryu Iaijutsu seminar on <strong>June 21th - June 27th, 2023</strong>. It is a rare opportunity to train with the 21st generation, Sekiguchi Komei sensei.
              Everyone is encourage to attend, even beginner students.
            </p>
            <p>Please note that <strong>masks are required</strong> for training during the seminar.</p>

            <p>
              The seminar training schedule is below. Please contact{' '}
              <a className="link" href="mailto:brandon@komeijyuku.com">
                Brandon
              </a> before paying to confirm attendance or if you have any questions.
            </p>

            <hr className="dark" />
          </div>

          {/*<div className="cs6">*/}
          {/*  <h3>Lubbock, Texas</h3>*/}
          {/*  <p>*/}
          {/*    Below is the tentative schedule. Please contact{' '}*/}
          {/*    <a className="link" href="mailto:bushey3@suddenlink.net">*/}
          {/*      Bushi sensei*/}
          {/*    </a>{' '}*/}
          {/*    for training times and pricing.*/}
          {/*  </p>*/}
          {/*  <strong>Schedule</strong>*/}
          {/*  <ul className="ul_square">*/}
          {/*    <li>June 16th - 19th, keiko TBD</li>*/}
          {/*  </ul>*/}
          {/*  <br />*/}

          {/*  <strong>Address &amp; Contact Info</strong>*/}
          {/*  <p>*/}
          {/*    ArtFit*/}
          {/*    <br />*/}
          {/*    1102 Slide Road*/}
          {/*    <br />*/}
          {/*    Lubbock, TX 79416*/}
          {/*    <br />*/}
          {/*    <br />*/}
          {/*    Phone: 806-781-1354*/}
          {/*    <br />*/}
          {/*    Map:{' '}*/}
          {/*    <a*/}
          {/*      className="link"*/}
          {/*      href="https://goo.gl/maps/55J675wEpRG2"*/}
          {/*      target="_blank"*/}
          {/*      rel="noopener noreferrer"*/}
          {/*    >*/}
          {/*      Google Map*/}
          {/*    </a>*/}
          {/*    <br />*/}
          {/*    Accommodations:{' '}*/}
          {/*    <a*/}
          {/*      className="link"*/}
          {/*      href="https://www.google.com/maps/search/hotels+near+ArtFit/@33.5787191,-101.9317938,14z/data=!3m1!4b1!4m5!2m4!5m3!5m2!1s2016-05-23!2i4"*/}
          {/*      target="_blank"*/}
          {/*      rel="noopener noreferrer"*/}
          {/*    >*/}
          {/*      Nearby Hotels*/}
          {/*    </a>*/}
          {/*  </p>*/}

          {/*  <strong>Lubbock Pricing</strong>*/}
          {/*  <p>*/}
          {/*    Contact{' '}*/}
          {/*    <a className="link" href="mailto:bushey3@suddenlink.net">*/}
          {/*      Bushi sensei*/}
          {/*    </a>{' '}*/}
          {/*    for Lubbock pricing.*/}
          {/*  </p>*/}
          {/*</div>*/}

          <div className="cs4">
            <h3>Schedule</h3>
            <ul className="ul_square">
              <li>
                <strong>Wednesday, June 21st:</strong>
                <br />
                Arrival
                <br />
                No keiko
              </li>
              <li>
                <strong>Thursday, June 22nd:</strong>
                <br />
                Morning keiko: 10am - 1pm
                <br />
                Afternoon keiko: 6pm - 8pm
              </li>
              <li>
                <strong>Friday, June 23rd:</strong>
                <br />
                Morning keiko: 10am - 1pm
                <br />
                Afternoon keiko: 6pm - 8pm
              </li>
              <li>
                <strong>Saturday, June 24th:</strong>
                <br />
                Morning keiko: 10am - 1pm
                <br />
                Afternoon keiko: 6pm - 8pm
              </li>
              <li>
                <strong>Sunday, June 25th: </strong>
                <br />
                Morning keiko: 10am - 1pm
                <br />
                Afternoon keiko: 6pm - 8pm
              </li>
              <li>
                <strong>Monday, June 26th:</strong>
                <br />
                Morning keiko: 10am - 1pm
                <br />
                Afternoon activity TBD
              </li>
              <li>
                <strong>Tuesday, June 27th:</strong>
                <br />
                Departure for Haneda
                <br />
                No keiko
              </li>
            </ul>
            <br />
          </div>
          <div className="cs4">
            <h3>Address &amp; Contact</h3>
            <p>
              Cedar Park Dojo
              <br />
              300 Brushy Creek Rd Ste 405
              <br />
              Cedar Park, TX, 78613
              <br />
              <a className="link" href="https://g.page/CedarParkDojo?share">
                View Map
              </a>
              <br />
              <a
                className="link"
                href="https://www.google.com/maps/search/Hotels/@30.5046957,-97.8345475,14z/data=!3m1!4b1!4m7!2m6!3m5!2sCedar+Park+Dojo!3s0x865b2da1155f378f:0x6bd60833d4e95385!4m2!1d-97.8170379!2d30.5046992"
                target="_blank"
                rel="noopener noreferrer"
              >
                Nearby Accommodations
              </a>
            </p>
            <p>
              Email: <a className="link" href="mailto:brandon@komeijyuku.com">brandon&#64;komeijyuku.com</a>
              <br />
              Phone: 512-965-3747
            </p>
          </div>
          <div className="cs4">
            <h3>Seminar Pricing</h3>
            <ul className="ul_square">
              <li>
                Individual day rate: <strong>$100 / day</strong>
                <br />
              </li>
              <li>
                All days / full seminar: <strong>$300</strong>
                <br />
              </li>
              <li>PayPal: brandon&#64;komeijyuku.com</li>
              <li>Venmo: @brandon-burkett-mjer</li>
              <li>Zelle: Austin Komei Jyuku</li>
            </ul>
          </div>
        </PanelContent>
      </PanelSection>
      <PanelSection color="cream">
        <PanelContent>
          <ResponsiveMap>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110004.52931644666!2d-97.88896123812094!3d30.502893503723556!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x865b2da1155f378f%3A0x6bd60833d4e95385!2sCedar%20Park%20Dojo!5e0!3m2!1sen!2sus!4v1616347003684!5m2!1sen!2sus"
              width="800"
              height="600"
              style={{ border: 0 }}
              allowFullScreen={true}
              title="Google Map"
            />
          </ResponsiveMap>
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

export default Seminars;
