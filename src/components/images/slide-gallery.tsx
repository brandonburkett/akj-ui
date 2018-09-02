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
    this.renderLeftNav = this.renderLeftNav.bind(this);
    this.renderRightNav = this.renderRightNav.bind(this);
    this.renderPlayPauseButton = this.renderPlayPauseButton.bind(this);
    this.renderFullscreenButton = this.renderFullscreenButton.bind(this);
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

  renderLeftNav(onClick: (e: React.MouseEvent<HTMLElement>) => void, disabled: boolean) {
    return (
      <button
        className="image-gallery-left-nav slide-gallery-previous-control"
        aria-label="Previous Slide"
        disabled={disabled}
        onClick={e => this.stopAutoplayClick(e, onClick)}
      />
    );
  }

  renderRightNav(onClick: (e: React.MouseEvent<HTMLElement>) => void, disabled: boolean) {
    return (
      <button
        className="image-gallery-right-nav slide-gallery-next-control"
        aria-label="Next Slide"
        disabled={disabled}
        onClick={e => this.stopAutoplayClick(e, onClick)}
      />
    );
  }

  renderPlayPauseButton(onClick: (e: React.MouseEvent<HTMLElement>) => void, isPlaying: boolean) {
    return (
      <button
        type="button"
        aria-label="Play or Pause Slideshow"
        className={`image-gallery-play-button${isPlaying ? ' active' : ''} slide-gallery-play`}
        onClick={onClick}
      />
    );
  }

  renderFullscreenButton(
    onClick: (e: React.MouseEvent<HTMLElement>) => void,
    isFullscreen: boolean,
  ) {
    return (
      <button
        type="button"
        aria-label="Open Fullscreen"
        className={`image-gallery-fullscreen-button${
          isFullscreen ? ' active' : ''
        } slide-gallery-fullscreen`}
        onClick={onClick}
      />
    );
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
            showBullets={true}
            showFullscreenButton={true}
            useBrowserFullscreen={false}
            autoPlay={true}
            preventDefaultTouchmoveEvent={true}
            renderLeftNav={this.renderLeftNav}
            renderRightNav={this.renderRightNav}
            renderPlayPauseButton={this.renderPlayPauseButton}
            renderFullscreenButton={this.renderFullscreenButton}
            onTouchStart={this.touchPause}
            onScreenChange={this.toggleTranslateZ}
          />
        </div>
      </div>
    );
  }
}

export default SlideGallery;
