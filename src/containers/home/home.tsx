import * as React from 'react';

// styles
import './home.css';

// images
import imgIsshin from './images/isshin-800.png';
import imgEnbu from './images/akj-enbu-2020.jpg';
import imgKoiLily from './images/koi-lily-1920.jpg';
import imgMap from './images/map-cpd-800-2022.png';
import imgMjerKanji from './images/mjer-kanji.png';
import imgSeminar from './images/seminar-reiho-800.jpg';

// ui components
import BelowFold from '../../components/below-fold/below-fold';
import Footer from '../../components/footer/footer';
import BlockImageCTA from '../../components/ctas/block-image-cta';
import Head from '../../components/head/head';
import FullScreenParallaxImage from '../../components/images/full-screen-parallax-image';
import ResponsiveImage from '../../components/images/responsive-image';

// props
export interface IProps {
  location: {
    pathname: string;
  };
}

// homepage component
const Home: React.FunctionComponent<IProps> = props => {
  const scrollToRef = React.createRef<HTMLDivElement>();

  return (
    <React.Fragment>
      <Head
        title="Traditional Japanese Swordsmanship"
        desc="The Austin Komei Jyuku dojo is teaches Yamauchi-Ha Muso Jikiden Eishin-ryu Iaijutsu under Sekiguchi Komei Sensei in Austin, Texas."
        path={props.location.pathname}
      />
      <FullScreenParallaxImage
        backgroundImgSrc={imgKoiLily}
        scrollToRef={scrollToRef}
        parallaxSpeed={5}
      >
        <div className="big-brand">
          <div className="logo">
            <ResponsiveImage src={imgMjerKanji} alt="Muso Jikidien Eishin-ryu Iaijutsu" />
          </div>
          <h1 className="hidden" aria-hidden={false}>
            Austin Komei Jyuku
          </h1>
        </div>
      </FullScreenParallaxImage>

      <BelowFold role="main" ref={scrollToRef}>
        <section className="home group translate-z">
          <p className="intro">
            Austin Komei Jyuku teaches the koryu Japanese sword art of Yamauchi-ha Muso Jikiden Eishin-ryu Iaijutsu as taught by the 21st generation, Sekiguchi Komei sensei. The Komei Jyuku, also known as the Nihon Koden Bujutsu Iaido Renmei, is a member of the Nihon Kobudo Kyokai, one of the premiere martial arts organizations in Japan dedicated to preserving classical martial traditions. The Austin shibucho is Brandon Burkett who is a direct student to Sekiguchi sensei.
          </p>

          <div className="home-ctas group">
            <BlockImageCTA
              to="/iaijutsu"
              imgSrc={imgEnbu}
              imgAlt="Kobushidori"
              title="Iaijutsu"
              content="Muso Jikiden Eishin-ryu translates to &ldquo;peerless, direct
                  transmission, true-faith style of Eishin&rdquo;. It is one of the oldest martial art from Japan with an unbroken
                  history dating back to the late 16th century when it was founded by Hayashizaki Jinsuke Shigenobu."
            />
            <BlockImageCTA
              to="/schedule"
              imgSrc={imgMap}
              imgAlt="Map to dojo"
              title="Schedule"
              content="Class is held Monday and Wednesday from 8:00pm - 9:30pm at the Cedar Park Dojo. Saturday morning training from 9:00am - 11:00am."
            />
            <BlockImageCTA
              to="/seminars"
              imgSrc={imgSeminar}
              imgAlt="Tomoe sune"
              title="Seminars"
              content="Train during our yearly Muso Jikiden Eishin-ryu seminar in Austin. It is a rare opportunity to train with the 21st generation, Sekiguchi Komei sensei."
            />
          </div>
        </section>
        <section className="isshin translate-z">
          <div className="intro">
            <ResponsiveImage src={imgIsshin} alt="一心 - one heart" />
          </div>
        </section>
        <Footer />
      </BelowFold>
    </React.Fragment>
  );
};

export default Home;
