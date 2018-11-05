// gallery
import imgGallery1 from './images/hasso-no-kamae.jpg';
import imgGallery2 from './images/naginata-embu-1.jpg';
import imgGallery3 from './images/gedan-no-kamae.jpg';
import imgGallery4 from './images/naginata-bunkai.jpg';
import imgGallery5 from './images/kesagiri.jpg';
import imgGallery6 from './images/taka-ne-men.jpg';
import imgGallery7 from './images/dogiri.jpg';

export const imageGalleryRaw: string[] = [
  imgGallery1,
  imgGallery2,
  imgGallery3,
  imgGallery4,
  imgGallery5,
  imgGallery6,
  imgGallery7,
];

export default imageGalleryRaw.map(image => ({
  bulletClass: 'slide-gallery-bullet',
  original: image,
}));
