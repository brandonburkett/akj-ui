import * as React from 'react';
import ReactImageGallery, { ReactImageGalleryProps } from 'react-image-gallery';

// styles
import 'react-image-gallery/styles/css/image-gallery.css';
import './slide-gallery.css';

/**
 * Image gallery component based off of react-image-gallery
 */
class SlideGallery extends React.PureComponent<ReactImageGalleryProps> {
  readonly galleryRef: React.RefObject<ReactImageGallery>;
  protected translateZElems: NodeListOf<HTMLElement> | null;
  protected body: HTMLBodyElement | null;
  protected galleryElem: HTMLElement | null;
  protected fullScreenMode: boolean;

  constructor(props: ReactImageGalleryProps) {
    super(props);

    // default to false, not needed in state as there is no re-render
    this.fullScreenMode = false;

    // dom elems
    this.body = null;
    this.translateZElems = null;
    this.galleryElem = null;

    // refs
    this.galleryRef = React.createRef();

    // bindings
    this.stopAutoplayClick = this.stopAutoplayClick.bind(this);
    this.touchPause = this.touchPause.bind(this);
    this.toggleTranslateZ = this.toggleTranslateZ.bind(this);
  }

  // get translateZ elements so we can turn them off during full screen mode
  // they mess with position: fixed :(
  componentDidMount() {
    this.translateZElems = document.querySelectorAll('.translate-z');
    this.body = document.querySelector('body');
    this.galleryElem = document.querySelector('.slide-gallery-group');
  }

  // clean up references
  componentWillUnmount() {
    this.translateZElems = null;
    this.body = null;
  }

  // stop auto play and pass through gallery click (next / previous / bullet)
  stopAutoplayClick(
    e: React.MouseEvent<HTMLElement>,
    onClick?: (e: React.MouseEvent<HTMLElement>) => void,
  ) {
    if (this.galleryRef && this.galleryRef.current) {
      this.galleryRef.current.pause();

      if (onClick) {
        onClick(e);
      }
    }
  }

  touchPause() {
    if (this.galleryRef && this.galleryRef.current) {
      this.galleryRef.current.pause();
    }
  }

  // toggle transform as it causes a bug with position fixed
  toggleTranslateZ() {
    if (this.translateZElems) {
      this.translateZElems.forEach(elem => {
        if (!this.fullScreenMode) {
          // not in full screen mode, but about to be
          elem.style.transform = 'none';

          if (this.galleryElem && !elem.contains(this.galleryElem)) {
            elem.style.zIndex = '0';
          }
        } else {
          // in full screen mode, about to be off
          elem.style.transform = '';
          elem.removeAttribute('style');
        }
      });
    }

    // toggle overflow on body element to stop scrolling
    if (this.body) {
      if (!this.fullScreenMode) {
        // not in full screen mode, but about to be
        this.body.style.overflow = 'hidden';
      } else {
        // in full screen mode, about to be off
        this.body.style.overflow = '';
        this.body.removeAttribute('style');
      }
    }

    // toggle full screen mode tracker
    this.fullScreenMode = !this.fullScreenMode;
  }

  render() {
    return (
      <div className="slide-gallery-group group">
        <div className="slide-gallery-images">
          <ReactImageGallery
            ref={this.galleryRef}
            {...this.props}
            infinite={true}
            lazyLoad={true}
            showThumbnails={false}
            showPlayButton={false}
            showBullets={true}
            showFullscreenButton={true}
            useBrowserFullscreen={false}
            autoPlay={false}
            preventDefaultTouchmoveEvent={true}
            onTouchStart={this.touchPause}
            onScreenChange={this.toggleTranslateZ}
          />
        </div>
      </div>
    );
  }
}

export default SlideGallery;
