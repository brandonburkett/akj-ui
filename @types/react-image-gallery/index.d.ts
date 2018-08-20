/* tslint:disable */

// TODO: submit a PR for the react image gallery type definition
// @see https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react-image-gallery/index.d.ts

import * as ReactImageGallery from 'react-image-gallery';

declare module 'react-image-gallery' {
  export interface ReactImageGalleryProps {
    useTranslate3D?: boolean;
  }
}
