// gallery
import imgGallery1 from './images/yasukuni-2020.jpg';
import imgGallery2 from './images/burkett-sensei-2022.jpg';
import imgGallery3 from './images/seminar-2018.jpg';
import imgGallery4 from './images/sekiguchi-sensei-zengogiri.jpg';
import imgGallery5 from './images/tameshigiri-2022.jpg';
import imgGallery6 from './images/kumitachi-2022.jpg';
import imgGallery7 from './images/gansekiotoshi-2020.jpg';
import imgGallery8 from './images/muto-dori.jpg';
import imgGallery9 from './images/inazuma-2022.jpg';
import imgGallery10 from './images/suigetsuto-2022.jpg';
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
  originalAlt: 'Iaido training at Austin Komei Jyuku',
}));
