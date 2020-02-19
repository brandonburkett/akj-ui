import * as React from 'react';

// styles
import './home.css';

// images
import imgIsshin from './images/isshin-800.png';
import imgKobushidori from './images/kobushidori-800.jpg';
import imgKoiLily from './images/koi-lily-1920.jpg';
import imgMap from './images/map-800.jpg';
import imgMjerKanji from './images/mjer-kanji.png';
import imgSeminar from './images/seminar-reiho-800.jpg';

// ui components
import BelowFold from '../../components/below-fold/below-fold';
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
        desc="The Austin Komei Jyuku dojo is an official Komei Jyuku branch dojo and teaches Yamauchi-Ha Muso Jikiden Eishin-ryu Iaijutsu under Sekiguchi Komei Sensei in Austin, Texas."
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
            Austin Komei Jyuku is a traditional budo and Japanese swordsmanship dojo. It is an
            official Komei Jyuku branch school which is headed by Sekiguchi Komei sensei, the 21st
            head master. Brandon Burkett sensei opened the dojo in in 2008 and is the head
            instructor. At Austin Komei Jyuku, we train in Yamauchi-Ha Muso Jikiden Eishin-ryu
            iaijutsu.
          </p>

          <div className="home-ctas group">
            <BlockImageCTA
              to="/iaijutsu"
              imgSrc={imgKobushidori}
              imgAlt="Kobushidori"
              title="Iaijutsu"
              content="Muso Jikiden Eishin-ryu translates to &ldquo;peerless, direct
                  transmission, true-faith style&rdquo;. It is the second oldest martial art from Japan with an unbroken
                  history of 450 years and founded in 1590."
            />
            <BlockImageCTA
              to="/schedule"
              imgSrc={imgMap}
              imgAlt="Map to dojo"
              title="Schedule"
              content="Class is held every Tuesdays from 8:00pm - 9:00pm and Thursday from
                  8:30pm - 9:30pm at the Austin Sports Center in Cedar park."
            />
            <BlockImageCTA
              to="/seminars"
              imgSrc={imgSeminar}
              imgAlt="Tomoe sune"
              title="Seminars"
              content="Train during our yearly seminar in Austin. It is a rare opportunity to train with Sekiguchi sensei, the 21st Headmaster of Yamauchi-ha Muso Jikiden Eishin-ryu."
            />
          </div>
        </section>
        <section className="isshin translate-z">
          <div className="intro">
            <ResponsiveImage src={imgIsshin} alt="一心 - one heart" />
          </div>
        </section>
      </BelowFold>
    </React.Fragment>
  );
};

export default Home;
