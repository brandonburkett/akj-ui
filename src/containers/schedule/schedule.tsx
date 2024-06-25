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
const Schedule: React.FunctionComponent<IProps> = props => (
  <React.Fragment>
    <Head
      title="Schedule & Pricing"
      desc="Yamauchi-Ha Muso Jikiden Eishin Ryu Iaido classes on Monday, Wednesday, and Saturday."
      path={props.location.pathname}
    />
    <div id="main" className="group" role="main">
      <PanelSection>
        <PanelContent>
          <div className="cs12">
            <h1>Schedule &amp; Pricing</h1>
            <hr className="dark" />
          </div>
          <div className="cs6">
            <h3>Schedule</h3>
            <p>
              Class is held at the{' '}
              <a className="link" href="https://www.cedarparkdojo.com/">
                Cedar Park Dojo
              </a>{' '}
              (off 183).
            </p>
            <ul className="ul_square">
              <li>
                <strong>Monday</strong>: 8:00pm - 9:30pm{' '}
              </li>
              <li>
                <strong>Wednesday</strong>: 8:00pm - 9:30pm
              </li>
              <li>
                <strong>Saturday</strong>: 9:00am - 11:00am
              </li>
            </ul>

            <h4>Address</h4>
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
            </p>

            <h4>Contact</h4>
            <p>
              <a className="link" href="mailto:brandon@komeijyuku.com">
                brandon@komeijyuku.com
              </a>
              <br />
              512-965-3747
            </p>
          </div>
          <div className="cs6">
            <h3>Tuition</h3>
            <p>
              All prices are monthly. The Austin Komei Jyuku dojo <strong>does not</strong> use
              contracts, you may come as much or as little as your schedule allows.
            </p>

            <h4>Monthly Pricing</h4>
            <ul className="ul_square">
              <li>$90.00 - Iaijutsu</li>
              <li>PayPal: brandon&#64;komeijyuku.com</li>
              <li>Venmo: @brandon-burkett-mjer</li>
              <li>Zelle: Austin Komei Jyuku</li>
              <li>Apple Cash: 512-965-3747</li>
            </ul>
          </div>
          <div className="cs12">
            <hr className="dark" />
            <h3>School Links</h3>
            <ul className="ul_inline">
              <li>
                <a className="link" href="https://www.komeijuku.jp/">
                  Komei Juku Japan
                </a>
              </li>
              <li>
                <a className="link" href="https://www.nihonkobudokyoukai.org/">
                  Nihon Kobudo Kyoukai
                </a>
              </li>
              <li>
                <a className="link" href="https://www.nihonkobudokyoukai.org/martialarts/041/">
                  NKK - Komei Juku Page
                </a>
              </li>
              <li>
                <a
                  className="link"
                  href="https://artfitlubbock.com/japanese-swordsmanship-lubbock/"
                >
                  Texas Komei Jyuku
                </a>
              </li>
              <li>
                <a className="link" href="http://www.nmsk.org/">
                  New Mexico Komei Jyuku
                </a>
              </li>
              <li>
                <a className="link" href="http://www.maribu-boebingen.com">
                  Germany Komei Jyuku
                </a>
              </li>
              <li>
                <a className="link" href="http://imau.ictta.ru/">
                  Russia Komei Jyuku
                </a>
              </li>
              <li>
                <a className="link" href="https://www.facebook.com/KomeiJukuSydney/">
                  Syndney Komei Jyuku
                </a>
              </li>
              <li>
                <a className="link" href="http://komei-jyuku.asn.pl/">
                  Zory Komei Jyuku (Poland)
                </a>
              </li>
              <li>
                <a className="link" href="http://www.seishinkan.info/">
                  New Zealand Komei Jyuku
                </a>
              </li>
              <li>
                <a className="link" href="https://www.facebook.com/chudenhayanuki/">
                  Indonesia Komei Jyuku
                </a>
              </li>
              <li>
                <a className="link" href="http://kumizaza.ch/">
                  Switzerland Komei Jyuku
                </a>
              </li>
            </ul>
          </div>
          <div className="cs12">
            <hr className="dark" />
            <h3>Equipment and Gear</h3>
            <ul className="ul_inline">
              <li>
                <a className="link" href="http://www.e-bogu.com/">
                  E-bogu
                </a>
              </li>
              <li>
                <a className="link" href="http://www.nihonzashi.com/">
                  Nihonzashi
                </a>
              </li>
              <li>
                <a className="link" href="https://tozandoshop.com/">
                  Tozando
                </a>
              </li>
              <li>
                <a className="link" href="hhttps://www.yamatobudogu.com/">
                  Yamatou Budogu
                </a>
              </li>
              <li>
                <a className="link" href="http://www.swordstore.com/">
                  Sword Store
                </a>
              </li>
            </ul>
          </div>
        </PanelContent>
      </PanelSection>
      <PanelSection color="cream">
        <PanelContent>
          <ResponsiveMap>
            <div className="cs12">
              <h3 className="visuallyhidden">Map</h3>
            </div>
            <iframe
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110004.52931644666!2d-97.88896123812094!3d30.502893503723556!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x865b2da1155f378f%3A0x6bd60833d4e95385!2sCedar%20Park%20Dojo!5e0!3m2!1sen!2sus!4v1616347003684!5m2!1sen!2sus`}
              width="800"
              height="600"
              style={{ border: 0 }}
              loading="lazy"
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

export default Schedule;
