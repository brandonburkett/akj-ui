import * as React from 'react';

// images
import imgKobushidori from './images/kobushidori-1500.jpg';
import imageGallery from './iaijutsu-image-gallery';

// ui components
import BelowFold from '../../components/below-fold/below-fold';
import Head from '../../components/head/head';
import FullScreenParallaxImage from '../../components/images/full-screen-parallax-image';
// import ResponsiveImage from '../../components/images/responsive-image';
import PanelContent from '../../components/panels/panel-content';
import PanelSection from '../../components/panels/panel-section';
import Quote from '../../components/quote/quote';
import SlideGallery from '../../components/images/slide-gallery';
import Footer from '../../components/footer/footer';

// props
export interface IProps {
  location: {
    pathname: string;
  };
}

/**
 * Iai page component
 */
const Iaijutsu: React.FunctionComponent<IProps> = props => {
  // refs
  const scrollToRef = React.createRef<HTMLDivElement>();

  return (
    <React.Fragment>
      <Head
        title="Muso Jikiden Eishin-ryu Iaijutsu"
        desc="The Austin Komei Jyuku dojo teaches Yamauchi-Ha Muso Jikidien Eishin-ryu Iaijutsu under Sekiguchi Komei sensei."
        path={props.location.pathname}
      />
      <FullScreenParallaxImage
        backgroundImgSrc={imgKobushidori}
        scrollToRef={scrollToRef}
        parallaxSpeed={5}
        title="Muso Jikiden Eishin-ryu Iaijutsu"
        content="Traditional Japanese swordsmanship classes are held each Tuesday from 8:00pm - 9:00pm and Thursday from 8:30pm - 9:30pm at the Austin Sports Center in Cedar Park. Saturday morning training from 9:00am - 10:30am at the Cedar Park Dojo."
      />

      <BelowFold role="main" ref={scrollToRef}>
        <PanelSection>
          <PanelContent>
            <div className="cs12">
              <h2>History</h2>
            </div>
            <div className="cs6">
              <p>
                Muso Jikiden Eishin-ryu (<span lang="ja">無雙直傳英信流居合術</span>) translates to
                &ldquo;peerless, direct transmission, true-faith style&rdquo;. It is the second
                oldest martial art from Japan with an unbroken history of 450 years that was founded
                in 1590. The founder of Muso Jikiden Eishin-ryu was Hayashizaki Jinsuke Shigenobu,
                who also founded Hayashizaki Shimmei Muso-ryu, Muso-ryu, Hayashizaki-ryu,
                Hayashizaki Jinsuke-ryu, Muso Shinden-ryu, and Jushin-ryu. It is said he confined
                himself for approximately a hundred days in the Hayashizaki Myojin Shrine, where he
                received divine inspiration for a new body of sword techniques using a long sword.
              </p>
              <p>
                The term &lsquo;Eishin&rsquo; came from 7th generation headmaster, Hasegawa
                Chikaranosuke Eishin, who officially called the art Muso Jikiden Eishin-ryu. He also
                served the Tokugawa family in Nagoya and excelled in Kyudo. The title
                &lsquo;Muso&rsquo; (unparalleled / peerless) refers to the fact that Hasegawa Eishin
                was praised by Toyotomi Hideyoshi as &ldquo;a swordsman without equal&rdquo; when he
                saw a demonstration of his iaijutsu.
              </p>
            </div>
            <div className="cs6">
              <p>
                The 9th generation headmaster, Hayashi Rokudayu Morimasa, served the Tosa domain and
                established Eishin-ryu there. The 17th generation headmaster, Oe Masamichi
                formalized many of the waza in Muso Jikiden Eishin Ryu. He changed the names of the
                Omori-ryu and Hasegawa-ryu, (both styles were integrated into Eishin-ryu at the
                time) into Seiza no Bu and Tatehiza no Bu. Masamichi also organized the waza into
                logical order within each set. Yamauchi Toyotake, the 18th generation headmaster is
                the grandson of Yamauchi Yodo, the daimyo of Tosa. Yamauchi Toyotake taught many
                students in Tokyo and Kyoto and even served when called to do military service in
                1941. The 20th generation, Onoe Masamitsu, inherited it and passed it to the current
                21st generation, Sekiguchi Komei.
              </p>
            </div>
            <div className="cs12">
              <hr className="dark" />
              <p>
                The current (21st) soke is Sekiguchi Komei sensei. He created the Komei Jyuku, an
                international body of students, and spreads iaijutsu with the isshin / one heart (
                <span lang="ja">一心</span>) philosophy.
              </p>
            </div>
          </PanelContent>

          {/* image gallery */}
          <SlideGallery items={imageGallery} />

          {/* lineage */}
          <PanelContent>
            <div className="group">
              <div className="cs12">
                <h3>Lineage</h3>
              </div>

              <div className="cs4">
                <ul className="ul_square">
                  <li>Hayashizaki Jinsuke Shigenobu</li>
                  <li>Tamiya Heibei Shigemasa</li>
                  <li>Nagano Muraku Nyudo Kinrosai</li>
                  <li>Momo Gunbei Mitsushige</li>
                  <li>Arikawa Shozaemon Munetsugu</li>
                  <li>Banno Danemon no Jo Nobusada</li>
                  <li>Hasegawa Chikaranosuke Eishin (Hidenobu)</li>
                  <li>Arai Seitetsu Kiyonobu</li>
                  <li>Hayashi Rokudayu Morimasa</li>
                  <li>Hayashi Yasudayu Yasumasa</li>
                  <li>Oguro Motoemon Kiyokatsu</li>
                </ul>
              </div>
              <div className="cs4">
                <h4>Tanimura-Ha</h4>
                <ul className="ul_square">
                  <li>Hayashi Masu no Jo Masanari</li>
                  <li>Yoda Manzo Yorikatsu</li>
                  <li>Hayashi Yadayu Masayori</li>
                  <li>Tanimura Kame no Jo Yorikatsu</li>
                  <li>Goto Magobei Masasuke</li>
                  <li>Oe Masamishi</li>
                </ul>
              </div>
              <div className="cs4">
                <h4>Yamauchi-Ha</h4>
                <ul className="ul_square">
                  <li>Yamauchi Toyotake</li>
                  <li>Kono Kanemitsu</li>
                  <li>Onoue Masamitsu</li>
                  <li>Sekiguchi Komei</li>
                </ul>
              </div>
            </div>
          </PanelContent>
        </PanelSection>

        <PanelSection color="cream">
          <PanelContent>
            <div className="cs12">
              <h3>Kata</h3>
            </div>
            <div className="cs3">
              <h4>Shoden Seiza no Bu</h4>
              <ol className="ol_decimal">
                <li>Mae</li>
                <li>Migi</li>
                <li>Hidari</li>
                <li>Ushiro</li>
                <li>Yaegaki</li>
                <li>Ukenagashi</li>
                <li>Kaishaku</li>
                <li>Tsukekomi</li>
                <li>Tsukikage</li>
                <li>Oikaze</li>
                <li>Nukiuchi</li>
              </ol>
            </div>
            <div className="cs3">
              <h4>Chuden Tatehiza no Bu</h4>
              <ol className="ol_decimal">
                <li>Yokogumo</li>
                <li>Toranoissoku</li>
                <li>Inazuma</li>
                <li>Ukigumo</li>
                <li>Oroshi</li>
                <li>Iwanami</li>
                <li>Urokogaeshi</li>
                <li>Namigaeshi</li>
                <li>Takiotoshi</li>
                <li>Makko</li>
              </ol>
            </div>
            <div className="cs3">
              <h4>Okuden Tachi Waza no Bu</h4>
              <ol className="ol_decimal">
                <li>Yukizure</li>
                <li>Tsuredachi</li>
                <li>Somakuri</li>
                <li>Sodome</li>
                <li>Shinobu</li>
                <li>Yukichigai</li>
                <li>Sodesurigaeshi</li>
                <li>Moniri</li>
                <li>Kabezoe</li>
                <li>Ukenagashi</li>
              </ol>
              <ol className="ol_decimal">
                <li>Ittomagoi Ichi</li>
                <li>Ittomagoi Ni</li>
                <li>Ittomagoi San</li>
              </ol>
            </div>
            <div className="cs3">
              <h4>Okuden Suwari Waza</h4>
              <ol className="ol_decimal">
                <li>Kasumi</li>
                <li>Sunegakoi</li>
                <li>Tozume</li>
                <li>Towaki</li>
                <li>Shihogiri</li>
                <li>Tanashita</li>
                <li>Ryozume</li>
                <li>Torabashiri</li>
              </ol>
            </div>

            <div className="cs12">
              <hr className="dark" />
              <h3>Kumitachi</h3>
            </div>
            <div className="cs6">
              <h4>Nanahon Me No Kata</h4>
              <ol className="ol_decimal">
                <li>Deai</li>
                <li>Kobushidori</li>
                <li>Zetsumyoken</li>
                <li>Dokumyoken</li>
                <li>Tsubadome</li>
                <li>Ukenagashi</li>
                <li>Mappo</li>
              </ol>
            </div>
            <div className="cs6">
              <h4>Tsume-Iai</h4>
              <ol className="ol_decimal">
                <li>Hasso</li>
                <li>Kobushidori</li>
                <li>Iwanami</li>
                <li>Yaegaki</li>
                <li>Urokogaeshi</li>
                <li>Kuraiyurumi</li>
                <li>Tsubamegaeshi</li>
                <li>Gansekiotoshi</li>
                <li>Suigetsuto</li>
                <li>Kazumiken</li>
                <li>Uchikomi</li>
              </ol>
            </div>
            <div className="cs12">
              <hr className="dark" />
              <h3>Toho and Bangai</h3>
            </div>
            <div className="cs4">
              <h4>Toho Waza</h4>
              <ol className="ol_decimal">
                <li>Mae</li>
                <li>Zengogiri</li>
                <li>Kiriage</li>
                <li>Shihogiri</li>
                <li>Kissakigaeshi</li>
              </ol>
            </div>
            <div className="cs4">
              <h4>Bangai: Gohon Me No Kata</h4>
              <ol className="ol_decimal">
                <li>Mae</li>
                <li>Aranami</li>
                <li>Kesaguruma</li>
                <li>Takiguruma</li>
                <li>Tatsumaki</li>
              </ol>
            </div>
            <div className="cs4">
              <h4>Bangai: Sanban Me No Kata</h4>
              <ol className="ol_decimal">
                <li>Hayanami</li>
                <li>Raiden</li>
                <li>Jinrai</li>
              </ol>
            </div>
          </PanelContent>
        </PanelSection>

        <Quote
          content="Once you understand the long sword, you will know all shorter swords."
          author="Sekiguchi Komei sensei"
        />

        <Footer />
      </BelowFold>
    </React.Fragment>
  );
};

export default Iaijutsu;
