export const SITE_URL = 'https://austin.komeijyuku.com';
export const SITE_NAME = 'Austin Komei Jyuku';
export const CONTACT_EMAIL = 'brandon@komeijyuku.com';

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Iaijutsu', href: '/iaijutsu' },
  { label: 'Schedule', href: '/schedule' },
  { label: 'Seminars', href: '/seminars' },
  { label: 'Contact', href: 'mailto:brandon@komeijyuku.com', external: true },
];

export interface SocialLink {
  label: string;
  href: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Facebook', href: 'https://www.facebook.com/austinkomeijyuku' },
  { label: 'Instagram', href: 'https://www.instagram.com/austinkomeijyuku/' },
  { label: 'YouTube', href: 'http://www.youtube.com/user/austinkomeijyuku' },
];
