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

  constructor(props: ReactImageGalleryProps) {
    super(props);

    // refs
    this.galleryRef = React.createRef();

    // bindings
    this.stopAutoplayClick = this.stopAutoplayClick.bind(this);
    this.touchPause = this.touchPause.bind(this);
    this.renderLeftNav = this.renderLeftNav.bind(this);
    this.renderRightNav = this.renderRightNav.bind(this);
    this.renderPlayPauseButton = this.renderPlayPauseButton.bind(this);
    this.renderFullscreenButton = this.renderFullscreenButton.bind(this);
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
          />
        </div>
      </div>
    );
  }
}

export default SlideGallery;
