import * as React from 'react';

// styles
import './full-screen-parallax-image.css';

// images
import imgChevron from './images/chevron-down-icon.svg';

export interface IProps {
  title?: string;
  content?: string;
  backgroundImgSrc: string;
  scrollToRef?: React.RefObject<HTMLElement>;
  parallaxSpeed?: number;
}

/**
 * Full screen image with scroll to ref support
 */
class FullScreenParallaxImage extends React.PureComponent<IProps, {}> {
  static defaultProps: Partial<IProps> = {
    content: '',
    parallaxSpeed: 5,
    title: '',
  };

  readonly backgroundRef: React.RefObject<HTMLDivElement>;

  constructor(props: IProps) {
    super(props);

    // refs
    this.backgroundRef = React.createRef();

    // bindings
    this.handleScroll = this.handleScroll.bind(this);
    this.handleParallaxScroll = this.handleParallaxScroll.bind(this);
  }

  // handle scroll parallax
  componentDidMount() {
    document.addEventListener('scroll', this.handleParallaxScroll);

    if (
      /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent) &&
      this.backgroundRef &&
      this.backgroundRef.current
    ) {
      this.backgroundRef.current.style.backgroundAttachment = 'scroll';
    }
  }

  // end handle scroll parallax
  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleParallaxScroll);
  }

  handleParallaxScroll() {
    const { parallaxSpeed } = this.props;

    if (this.backgroundRef && this.backgroundRef.current && parallaxSpeed) {
      // calc scroll y to move slower than foreground
      const windowScrollY = window.pageYOffset || window.scrollY;
      const yPos = -(windowScrollY / parallaxSpeed);

      // put together our final background position
      const coords = `50% ${yPos}px`;

      // move the background slower than foreground
      this.backgroundRef.current.style.backgroundPosition = coords;
      // console.log('handleParallaxScroll', coords, this.backgroundRef.current.style);
    }
  }

  handleScroll(e: React.KeyboardEvent | React.MouseEvent) {
    const { scrollToRef } = this.props;

    if (scrollToRef && scrollToRef.current) {
      scrollToRef.current.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      // scrollToRef.current.scrollIntoView();
    }
  }

  render() {
    const { title, content, backgroundImgSrc, scrollToRef, children } = this.props;

    return (
      <section className="cover-parallax">
        {/*<div*/}
        {/*className="cover-image"*/}
        {/*style={{*/}
        {/*background: `#000000 url('${backgroundImgSrc}') 50% 0px / cover no-repeat fixed`,*/}
        {/*}}*/}
        {/*ref={this.backgroundRef}*/}
        {/*>*/}
        <div
          className="cover-image"
          style={{
            backgroundImage: `url('${backgroundImgSrc}')`,
          }}
          ref={this.backgroundRef}
        >
          {/* if children, render children only.. otherwise look at title / content */}
          {children ? (
            children
          ) : (
            <div className="cover-text">
              <h1 className="cover-title">{title}</h1>
              <p className="cover-content">{content}</p>
            </div>
          )}

          {scrollToRef ? (
            <div className="cover-scroll-cue" onClick={this.handleScroll}>
              <button className="cover-scroll-btn" aria-label="Scroll Down">
                <img src={imgChevron} alt="Scroll Down" aria-hidden={true} />
              </button>
            </div>
          ) : null}
        </div>
      </section>
    );
  }
}

export default FullScreenParallaxImage;
