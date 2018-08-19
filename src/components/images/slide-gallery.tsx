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
    this.renderLeftNav = this.renderLeftNav.bind(this);
    this.renderRightNav = this.renderRightNav.bind(this);
  }

  // stop auto play and pass through gallery click (next / previous / bullet)
  stopAutoplayClick(
    e: React.MouseEvent<HTMLElement>,
    onClick: (e: React.MouseEvent<HTMLElement>) => void,
  ) {
    if (this.galleryRef && this.galleryRef.current) {
      this.galleryRef.current.pause();
      onClick(e);
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
            showFullscreenButton={false}
            autoPlay={true}
            renderLeftNav={this.renderLeftNav}
            renderRightNav={this.renderRightNav}
          />
        </div>
      </div>
    );
  }
}

export default SlideGallery;
