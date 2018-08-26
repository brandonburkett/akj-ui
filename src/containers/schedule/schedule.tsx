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
const Schedule: React.StatelessComponent<IProps> = props => (
  <React.Fragment>
    <Head
      title="Schedule & Pricing"
      desc="The Austin Komei Jyuku dojo teaches Yamauchi-Ha Muso Jikiden Eishin Ryu Iaijutsu and Ryouen-ryu Naginatajutsu on Tuesdays and Thursdays."
      path={props.location.pathname}
    />
    <div id="main" className="group" role="main">
      <PanelSection>
        <PanelContent>
          <div className="cs12">
            <h1>Schedule &amp; Pricing</h1>
          </div>
          <div className="cs6">
            <p>
              Class is held every Tuesdays from 8:00pm - 9:00pm and Thursday from 8:30pm - 9:30pm at
              the{' '}
              <a className="link" href="http://www.austinsportscenter.com/centers/cedar-park">
                Austin Sports Center
              </a>{' '}
              (North Austin / Cedar Park). We meet in the SAQ room, which is the first right as you
              walk in.
            </p>

            <strong>Address</strong>
            <p>
              ASC Cedar Park
              <br />
              1420 Toro Grande Blvd.
              <br />
              Cedar Park, TX 78613
              <br />
              <a className="link" href="https://goo.gl/maps/w1of4">
                View Map
              </a>
            </p>

            <strong>Contact</strong>
            <p>
              <a className="link" href="mailto:brandon@komeijyuku.com">
                brandon@komeijyuku.com
              </a>
              <br />
              512-965-3747
            </p>
          </div>
          <div className="cs6">
            <p>
              All prices are monthly. The Austin Komei Jyuku dojo <strong>does not</strong> use
              contracts, you may come as much or as little as your schedule allows. For yearly,
              lifetime, and private lessons, please{' '}
              <a className="link" href="mailto:brandon@komeijyuku.com">
                contact Burkett sensei
              </a>{' '}
              directly.
            </p>

            <strong>Single Prices</strong>
            <ul className="ul_square">
              <li>$60.00 - Iaijutsu / Naginatajutsu</li>
            </ul>
            <strong>Family Prices</strong>
            <ul className="ul_square">
              <li>$60.00 - First family member</li>
              <li>$40.00 - Each additional member</li>
            </ul>
            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
              <input type="hidden" name="cmd" value="_s-xclick" />
              <input
                type="submit"
                className="form_button"
                id="s002Button"
                value="PayPal - $60.00"
              />
              <input
                type="hidden"
                name="encrypted"
                value="-----BEGIN PKCS7-----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-----END PKCS7-----"
              />
            </form>

            <form action="https://www.paypal.com/cgi-bin/webscr" method="post">
              <input type="hidden" name="cmd" value="_s-xclick" />
              <input
                type="submit"
                className="form_button"
                id="s001Button"
                value="PayPal - $40.00"
              />
              <input
                type="hidden"
                name="encrypted"
                value="-----BEGIN PKCS7-----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-----END PKCS7-----"
              />
            </form>
            <br />
          </div>
          <div className="cs12">
            <h3>School Links</h3>
            <ul className="ul_inline">
              <li>
                <a className="link" href="http://www.komeijuku.com/">
                  Hawaii Komei Jyuku
                </a>
              </li>
              <li>
                <a className="link" href="http://www.katsujin.org/">
                  Texas Komei Jyuku
                </a>
              </li>
              <li>
                <a className="link" href="http://www.shobukan.org/">
                  Shobukan
                </a>
              </li>
              <li>
                <a className="link" href="http://www.mizukan.org">
                  Colorado Komei Jyuku
                </a>
              </li>
              <li>
                <a className="link" href="http://www.nmsk.org/">
                  New Mexico Komei Jyuku
                </a>
              </li>
              <li>
                <a className="link" href="http://www.komeijuku.org/">
                  Portland Komei Jyuku
                </a>
              </li>
              <li>
                <a className="link" href="http://www.miami-komei-jyuku.org/">
                  Florida Komei Jyuku
                </a>
              </li>
              <li>
                <a className="link" href="http://komeijuku.org/">
                  Portland Komei Jyuku
                </a>
              </li>
              <li>
                <a className="link" href="http://www.maribu-boebingen.com">
                  Germany Komei Jyuku
                </a>
              </li>
              <li>
                <a className="link" href="http://www.komeijyuku.com.ar/">
                  Argentina Komei Jyuku
                </a>
              </li>
              <li>
                <a className="link" href="http://www.seishukai.at/">
                  Austria Komei Jyuku
                </a>
              </li>
              <li>
                <a className="link" href="http://imau.ictta.ru/">
                  Russia Komei Jyuku
                </a>
              </li>
              <li>
                <a className="link" href="http://www.komei-jyuku-polska.pl/">
                  Poland Komei Jyuku
                </a>
              </li>
              <li>
                <a className="link" href="http://www.komei-juku.com/">
                  Australia Komei Jyuku
                </a>
              </li>
              <li>
                <a className="link" href="http://komei-jyuku.asn.pl/">
                  Zory Komei Jyuku (Poland)
                </a>
              </li>
              <li>
                <a className="link" href="http://www.guard7.cz/mjer/">
                  Czech Republic Komei Jyuku
                </a>
              </li>
              <li>
                <a className="link" href="http://www.seishinkan.info/">
                  New Zealand Komei Jyuku
                </a>
              </li>
              <li>
                <a className="link" href="http://www.komei-savigny-juku.new.fr/">
                  France Komei Jyuku
                </a>
              </li>
              <li>
                <a className="link" href="http://www.komeijuku.or.id/">
                  Indonesia Komei Jyuku
                </a>
              </li>
              <li>
                <a className="link" href="http://kumizaza.ch/">
                  Switzerland Komei Jyuku
                </a>
              </li>
            </ul>

            <h3>Equipment and Gear</h3>
            <ul className="ul_inline">
              <li>
                <a className="link" href="http://www.iaijutsu.pl/podstrony-eng/bokkeny-eng.php">
                  Poland Bokuto
                </a>
              </li>
              <li>
                <a className="link" href="http://www.bukikan.com/">
                  Bukikan
                </a>
              </li>
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
                <a className="link" href="http://www.swordstore.com/">
                  Sword Store
                </a>
              </li>
              <li>
                <a className="link" href="http://www.tozando.com/">
                  Tozando
                </a>
              </li>
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

export default Schedule;
