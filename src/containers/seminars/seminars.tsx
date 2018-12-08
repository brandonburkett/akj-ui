import * as React from 'react';

// ui
import Head from '../../components/head/head';
import PanelContent from '../../components/panels/panel-content';
import PanelSection from '../../components/panels/panel-section';
import Quote from '../../components/quote/quote';
import ResponsiveMap from '../../components/maps/responsive-map';

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
        <PanelContent>
          <div className="cs12">
            <h1>2018 Texas Seminar</h1>
          </div>
          <div className="cs12">
            <p>
              Sekiguchi sensei will be in Texas for one week -{' '}
              <strong>September 27 - October 3rd, 2018</strong>. This time will be split between
              Lubbock and Austin. It is a rare opportunity to train with Sekiguchi sensei, the 21st
              Headmaster of Yamauchi-ha Muso Jikiden Eishin-ryu. <strong>Everyone</strong> is
              encourage to attend, even beginner students.
            </p>
          </div>
          <div className="cs6">
            <h3>Lubbock, Texas</h3>
            <p>
              Below is the tentative schedule. Please contact{' '}
              <a className="link" href="mailto:bushey3@suddenlink.net">
                Bushi sensei
              </a>{' '}
              for training times and pricing.
            </p>
            <strong>Schedule</strong>
            <ul className="ul_square">
              <li>TBD</li>
            </ul>
            <br />

            <strong>Address &amp; Contact Info</strong>
            <p>
              ArtFit
              <br />
              1102 Slide Road
              <br />
              Lubbock, TX 79416
              <br />
              <br />
              Phone: 806-781-1354
              <br />
              Map:{' '}
              <a className="link" href="https://goo.gl/maps/55J675wEpRG2" target="_blank">
                Google Map
              </a>
              <br />
              Accommodations:{' '}
              <a
                className="link"
                href="https://www.google.com/maps/search/hotels+near+ArtFit/@33.5787191,-101.9317938,14z/data=!3m1!4b1!4m5!2m4!5m3!5m2!1s2016-05-23!2i4"
                target="_blank"
              >
                Nearby Hotels
              </a>
            </p>

            <strong>Lubbock Pricing</strong>
            <p>
              Contact{' '}
              <a className="link" href="mailto:bushey3@suddenlink.net">
                Bushi sensei
              </a>{' '}
              for Lubbock pricing.
            </p>
          </div>
          <div className="cs6">
            <h3>Austin, Texas</h3>
            <p>
              The training schedule for Austin is almost set, more information will be posted soon!
              Please contact{' '}
              <a className="link" href="mailto:brandon@komeijyuku.com">
                Brandon Burkett sensei
              </a>{' '}
              for questions.
            </p>
            <strong>Schedule</strong>
            <ul className="ul_square">
              <li>
                Sunday, Sept 30th:
                <br />
                Morning Arrival
                <br />
                Afternoon keiko: 6pm - 8pm
              </li>
              <li>
                Monday, Oct 1st: <br />
                Morning keiko: 10am - 1pm
                <br />
                Afternoon keiko: 6pm - 8pm
              </li>
              <li>
                Tuesday, Oct 2nd: <br />
                Morning keiko: 10am - 1pm
                <br />
                Afternoon keiko: 5pm - 7pm
              </li>
              <li>
                Wednesday, Oct 3rd:
                <br />
                Departure, no keiko
              </li>
            </ul>
            <br />

            <strong>Address &amp; Contact Info</strong>
            <p>
              Austin Sports Center - Cedar Park
              <br />
              1420 Toro Grande Dr
              <br />
              Cedar Park, TX 78613
              <br />
              <br />
              Phone: 512-965-3747
              <br />
              Map:{' '}
              <a className="link" href="https://goo.gl/maps/URJUTKUUxZM2" target="_blank">
                Google Map
              </a>
              <br />
              Accommodations:{' '}
              <a
                className="link"
                href="https://www.google.com/maps/search/hotels+near+Austin+Sports+Center+cedar+park/@30.5437498,-97.8031795,13z/data=!4m5!2m4!5m3!5m2!1s2016-05-30!2i4"
                target="_blank"
              >
                Nearby Hotels
              </a>
            </p>

            <strong>Austin Pricing</strong>
            <p>The seminar will be shorter this year, so pricing is discounted.</p>
            <ul className="ul_square">
              {/*<li>*/}
              {/*Individual / Per Day Rate<br />*/}
              {/*<form target="paypal" action="https://www.paypal.com/cgi-bin/webscr" method="post">*/}
              {/*<input type="hidden" name="cmd" value="_s-xclick">*/}
              {/*<input type="hidden" name="hosted_button_id" value="9TYZRM8LJEBFN">*/}
              {/*<input type="submit" class="form_button" id="s001Button" value="PayPal - $65.00" />*/}
              {/*<img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">*/}
              {/*</form>*/}
              {/*</li>*/}
              <li>
                All days / Full Seminar
                <br />
                <form target="paypal" action="https://www.paypal.com/cgi-bin/webscr" method="post">
                  <input type="hidden" name="cmd" value="_s-xclick" />
                  <input type="hidden" name="hosted_button_id" value="X2GS3458XA6SA" />
                  <input
                    type="submit"
                    className="form-button"
                    id="s001Button"
                    value="PayPal - $75.00"
                  />
                  <img
                    alt=""
                    style={{ border: 0 }}
                    src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif"
                    width="1"
                    height="1"
                  />
                </form>
                {/*<form target="paypal" action="https://www.paypal.com/cgi-bin/webscr" method="post">*/}
                {/*<input type="hidden" name="cmd" value="_s-xclick">*/}
                {/*<input type="hidden" name="hosted_button_id" value="BTG5VJ3NREKX4">*/}
                {/*<input type="submit" class="form_button" id="s001Button" value="PayPal - $250.00" />*/}
                {/*<img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">*/}
                {/*</form>*/}
              </li>
              <li>PayPal Email: brandon&#64;komeijyuku.com</li>
            </ul>
          </div>
        </PanelContent>
      </PanelSection>
      <PanelSection color="cream">
        <PanelContent>
          <ResponsiveMap>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d109958.2234716137!2d-97.84696294558017!3d30.54380884107428!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644d336df6c8b5d%3A0x5b4caa72f18797c9!2sAustin+Sports+Center!5e0!3m2!1sen!2sus!4v1535304224217"
              width="800"
              height="600"
              style={{ border: 0 }}
              allowFullScreen={true}
            />
          </ResponsiveMap>
        </PanelContent>
      </PanelSection>
      <Quote
        content="The most difficult rival you will ever face is yourself."
        author="Sekiguchi Komei sensei"
      />
    </div>
  </React.Fragment>
);

export default Seminars;
