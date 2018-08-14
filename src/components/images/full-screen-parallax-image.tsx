import * as React from 'react';

// styles
import './full-screen-parallax-image.css';

// images
import imgChevron from './images/chevron-lt.png';

export interface IProps {
  title?: string;
  content?: string;
  backgroundImgSrc: string;
  scrollToRef?: React.RefObject<HTMLElement>;
}

export interface IState {
  parallaxSpeed: number;
}

/**
 * Full screen image with scroll to ref support
 */
class FullScreenParallaxImage extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      parallaxSpeed: 5,
    };

    // bindings
    this.handleScroll = this.handleScroll.bind(this);
  }

  handleScroll(e: React.KeyboardEvent | React.MouseEvent) {
    const { scrollToRef } = this.props;

    if (scrollToRef && scrollToRef.current) {
      scrollToRef.current.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  }

  render() {
    const { title, content, backgroundImgSrc, scrollToRef, children } = this.props;

    return (
      <section className="cover-parallax">
        <div
          className="cover-image"
          style={{ background: `#000000 url('${backgroundImgSrc}') 50% 0px / cover no-repeat` }}
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
              <button>
                <img src={imgChevron} alt="Scroll down" />
              </button>
            </div>
          ) : null}
        </div>
      </section>
    );
  }
}

export default FullScreenParallaxImage;
