// gallery
import imgGallery0 from './images/1280-tokyo-enbu.webp';
import imgGallery1 from './images/yasukuni-2020.jpg';
import imgGallery2 from './images/1280-oita-enbu-group.webp';
import imgGallery3 from './images/1280-seiza.webp';
import imgGallery4 from './images/sekiguchi-sensei-zengogiri.jpg';
import imgGallery5 from './images/tameshigiri-2022.jpg';
import imgGallery6 from './images/kumitachi-2022.jpg';
import imgGallery7 from './images/1280-oita-kesagake.webp';
import imgGallery8 from './images/1280-tokyo-group.webp';
import imgGallery9 from './images/muto-dori.jpg';
import imgGallery10 from './images/inazuma-2022.jpg';
import imgGallery11 from './images/suigetsuto-2022.jpg';
import imgGallery12 from './images/sekiguchi-sensei-chuden.jpg';
import imgGallery13 from './images/reiho.jpg';

export const imageGalleryRaw: string[] = [
  imgGallery0,
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
  imgGallery13,
];

export default imageGalleryRaw.map(image => ({
  bulletClass: 'slide-gallery-bullet',
  original: image,
  originalAlt: 'Iaido training at Austin Komei Jyuku',
}));
