import * as React from 'react';
import Head from '../../components/head/head';

export interface IProps {
  location: {
    pathname: string;
  };
}

const Home: React.StatelessComponent<IProps> = props => (
  <React.Fragment>
    <Head
      title="Traditional Japanese Swordsmanship"
      desc="The Austin Komei Jyuku dojo is an official Komei Jyuku branch dojo and teaches Yamauchi-Ha Muso Jikiden Eishin-ryu Iaijutsu under Sekiguchi Komei Sensei in Austin, Texas."
      path={props.location.pathname}
    />
    {/*<section id="brand_splash">*/}
    {/*<div className="background_img homepage" parallax speed="5">*/}
    {/*<div className="big_brand">*/}
    {/*<div className="logo">*/}
    {/*<img className="fit_img" src="media/content-images/mjer-kanji.png" alt="Muso Jikidien Eishin-ryu Iaijutsu">*/}
    {/*</div>*/}
    {/*<h1 className="hidden">Austin Komei Jyuku</h1>*/}
    {/*</div>*/}
    {/*<div className="scroll_cue">*/}
    {/*<a className="" href="#quote" wb-auto-scroll><img src="media/content-images/chevron-lt.png" alt="Chevron"></a>*/}
    {/*</div>*/}
    {/*</div>*/}
    {/*</section>*/}

    {/*<div id="main_push" className="group" role="main">*/}
    {/*<section id="quote" className="home group">*/}
    {/*<p className="intro">The Austin Komei Jyuku is a traditional budo and Japanese swordsmanship dojo. It is an*/}
    {/*official branch of the Komei Jyuku which is headed by Sekiguchi Komei sensei and under the guidance of the*/}
    {/*Texas Komei Jyuku which is headed by Walt Bushey sensei. At the Austin Komei Jyuku, we train in Yamauchi-Ha*/}
    {/*Muso Jikiden Eishin-ryu iaijutsu and Ryouen-ryu naginatajutsu.</p>*/}

    {/*<div className="quote_snapshots group">*/}
    {/*<a className="quote_snapshot" href="iaijutsu">*/}
    {/*<img className="fit_img" src="media/content-images/kobushidori-800.jpg" alt="Kobushidori">*/}
    {/*<div className="snapshot_info">*/}
    {/*<div className="snapshot_title">Iaijutsu</div>*/}
    {/*<div className="snapshot_details">Muso Jikiden Eishin-ryu translates to &ldquo;peerless, direct*/}
    {/*transmission, true-faith style&rdquo;. It is the second oldest martial art from Japan with an unbroken*/}
    {/*history of 450 years and founded in 1590.*/}
    {/*</div>*/}
    {/*<div className="snapshot_icon"><img src="media/content-images/more.png" alt="More"></div>*/}
    {/*</div>*/}
    {/*</a>*/}
    {/*<a className="quote_snapshot" href="schedule">*/}
    {/*<img className="fit_img" src="media/content-images/map-800.jpg" alt="Austin Komei Jyuku Map">*/}
    {/*<div className="snapshot_info">*/}
    {/*<div className="snapshot_title">Schedule</div>*/}
    {/*<div className="snapshot_details">Class is held every Tuesdays from 8:00pm - 9:00pm and Thursday from*/}
    {/*8:30pm - 9:30pm at the Austin Sports Center in Cedar park.*/}
    {/*</div>*/}
    {/*<div className="snapshot_icon"><img src="media/content-images/more.png" alt="More"></div>*/}
    {/*</div>*/}
    {/*</a>*/}
    {/*<a className="quote_snapshot" href="naginatajutsu">*/}
    {/*<img className="fit_img" src="media/content-images/naginata-800.jpg" alt="">*/}
    {/*<div className="snapshot_info">*/}
    {/*<div className="snapshot_title">Naginatajutsu</div>*/}
    {/*<div className="snapshot_details">Ryouen Ryu Naginatajutsu specializes in the use of the bladed polearm*/}
    {/*(naginata) and the long knife (kowakizashi) used together for long and short distance ancient*/}
    {/*combative techniques.*/}
    {/*</div>*/}
    {/*<div className="snapshot_icon"><img src="media/content-images/more.png" alt="More"></div>*/}
    {/*</div>*/}
    {/*</a>*/}
    {/*</div>*/}
    {/*</section>*/}
    {/*<section id="isshin">*/}
    {/*<div className="intro">*/}
    {/*<img className="fit_img" src="media/content-images/isshin-800.png" alt="Isshin - one heart">*/}
    {/*</div>*/}
    {/*</section>*/}
    {/*</div>*/}
  </React.Fragment>
);

export default Home;
