// gallery
import imgGallery1 from './images/sekiguchi-sensei-tatehiza.jpg';
import imgGallery2 from './images/seminar-2018.jpg';
import imgGallery3 from './images/burkett-sensei.jpg';
import imgGallery4 from './images/sekiguchi-sensei-zengogiri.jpg';
import imgGallery5 from './images/tameshigiri.jpg';
import imgGallery6 from './images/nage-waza.jpg';
import imgGallery7 from './images/daei-uchitachi.jpg';
import imgGallery8 from './images/muto-dori.jpg';
import imgGallery9 from './images/sword-cleaning.jpg';
import imgGallery10 from './images/daei-shitachi.jpg';
import imgGallery11 from './images/sekiguchi-sensei-chuden.jpg';
import imgGallery12 from './images/reiho.jpg';

export const imageGalleryRaw: string[] = [
  imgGallery1,
  imgGallery2,
  imgGallery3,
  imgGallery4,
  imgGallery5,
  imgGallery6,
  imgGallery7,
  imgGallery8,
  imgGallery9,
  imgGallery10,
  imgGallery11,
  imgGallery12,
];

export default imageGalleryRaw.map(image => ({
  bulletClass: 'slide-gallery-bullet',
  original: image,
}));
