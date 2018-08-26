import * as React from 'react';

// images
import imgNaginataSune from './images/naginata-sune-1500.jpg';
import imageGallery from './naginatajutsu-image-gallery';

// ui components
import BelowFold from '../../components/below-fold/below-fold';
import Head from '../../components/head/head';
import FullScreenParallaxImage from '../../components/images/full-screen-parallax-image';
// import ResponsiveImage from '../../components/images/responsive-image';
import PanelContent from '../../components/panels/panel-content';
import PanelSection from '../../components/panels/panel-section';
import Quote from '../../components/quote/quote';
import SlideGallery from '../../components/images/slide-gallery';

// props
export interface IProps {
  location: {
    pathname: string;
  };
}

/**
 * Naginata page component
 */
const Naginatajutsu: React.StatelessComponent<IProps> = props => {
  // refs
  const scrollToRef = React.createRef<HTMLDivElement>();

  return (
    <React.Fragment>
      <Head
        title="Ryouen-ryu Naginatajutsu"
        desc="The Austin Komei Jyuku dojo teaches Ryouen-ryu Naginatajutsu under Shimizu Nobuko sensei."
        path={props.location.pathname}
      />
      <FullScreenParallaxImage
        backgroundImgSrc={imgNaginataSune}
        scrollToRef={scrollToRef}
        parallaxSpeed={5}
        title="Ryouen-ryu Naginatajutsu"
        content="Traditional Japanese polearm classes are held on Tuesdays from 8:00pm - 9:00pm and Thursday from 8:30pm - 9:30pm at the Austin Sports Center in Cedar Park."
      />

      <BelowFold role="main" ref={scrollToRef}>
        <PanelSection>
          <PanelContent>
            <div className="cs12">
              <h2>History</h2>
            </div>
            <div className="cs6">
              <p>
                Ryouen-ryu Naginatajutsu (<span lang="ja">菱延流凪刀術</span>) was created/founded
                by Shimizu Nobuko sensei after a lifetime of training in Jikishinkage Ryu
                Naginatajutsu, Ogasawara Ryu Reiho-gaku, and Muso Jikiden Eishin Ryu Iaijutsu.
                Shimizu sensei received the Tora no Maki for Jikishinkage Ryu Naginatajutsu from the
                17th soke, Toya Akiko in 1998. She was also granted Menkyo Kaiden for Ogasawara Ryu
                Reiho-gaku from the 32nd Soke, Tadamune Ogasawara in 1984. In Muso Jikiden Eishin
                Ryu, she holds the position of Jikimon kenshi to the 21st Soke, Sekiguchi Komei
                sensei.
              </p>
            </div>
            <div className="cs6">
              <p>
                Ryouen Ryu Naginatajutsu specializes in the use of the bladed polearm (naginata) and
                the long knife (kowakizashi) used together for long and short distance ancient
                combative techniques.
              </p>
            </div>
          </PanelContent>

          {/* image gallery */}
          <SlideGallery items={imageGallery} />

          {/* lineage */}
          <PanelContent>
            <div className="cs12">
              <h3>Kata</h3>
            </div>
            <div className="cs4">
              <h4>Shoden</h4>
              <ol className="ol_decimal">
                <li>Minamo</li>
                <li>Dogiri</li>
                <li>Shingetsu</li>
                <li>Muso</li>
                <li>Senpu</li>
                <li>Musumikiri</li>
                <li>Naginata kouju</li>
                <li>Naginata zouri</li>
                <li>Zashou</li>
                <li>Fuji no mine</li>
              </ol>
            </div>
            <div className="cs4">
              <h4>Ryu No Bu</h4>
              <ol className="ol_decimal">
                <li>Hatsunagi</li>
                <li>Yamato emaki</li>
                <li>Nami tsumi</li>
                <li>Ryuen</li>
                <li>Koga Arashi</li>
              </ol>
            </div>
            <div className="cs4">
              <h4>Tora No Bu</h4>
              <ol className="ol_decimal">
                <li>Hi omote</li>
                <li>Futae no nagiri</li>
                <li>Hishou</li>
                <li>Nihen gaeshi</li>
                <li>Nishiki goromo</li>
                <li>Naginata houzuki</li>
                <li>Funa watashi</li>
              </ol>
            </div>
          </PanelContent>
        </PanelSection>

        <Quote
          content="The naginata must move like a wave and strike with the force of the tide."
          author="Shimizu Nobuko sensei"
        />
      </BelowFold>
    </React.Fragment>
  );
};

export default Naginatajutsu;
