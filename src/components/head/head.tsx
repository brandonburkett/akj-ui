/**
 * Dependencies
 */
import React, {PureComponent, ReactNode} from 'react';
import Helmet from 'react-helmet';

// image includes
import defaultOgpImage from './images/ogp-mon-1200-630.png';

// import icon from '../styles/icons/icon-rightgift-green-192.png';

/**
 * Component props
 */
export interface IProps {
  base?: string;
  env?: string;
  gtmId?: string,
  title: string,
  desc: string,
  path: string,
  image?: string,
  noIndex?: boolean,
  children?: ReactNode,
}

/**
 * Use helmet to setup a template for head tags for SEO.
 */
class Head extends PureComponent<IProps> {
  static defaultProps: Partial<IProps> = {
    base:
      typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '',
    children: null,
    env: 'production',
    gtmId: process.env.REACT_APP_GA_ID || '',
    image: defaultOgpImage,
    noIndex: false,
  };

  render() {
    const {
      base,
      env,
      gtmId,
      title,
      desc,
      path,
      image,
      noIndex,
      children,
    } = this.props;

    // default title if one is not provided
    const defaultTitle = 'Austin Komei Jyuku';
    const canonicalImage = `${image}`;

    // remove trailing slash (if present) for canonical url
    let canonicalUrl = `${base}${path.substring(1, path.length)}`;
    canonicalUrl = canonicalUrl.replace(/\/$/, '');

    // social sharing tags
    // @see: http://ogp.me/
    const fb = [
      {property: 'og:type', content: 'website'},
      {property: 'og:image', content: canonicalImage},
      {property: 'og:url', content: canonicalUrl},
      {property: 'og:site_name', content: defaultTitle},
      {property: 'og:title', content: title},
      {property: 'og:description', content: desc},
      {property: 'og:locale', content: 'en_US'},
    ];

    // @see: https://dev.twitter.com/cards/markup
    const twitter = [
      {property: 'twitter:site', content: '@akjdojo'},
      {property: 'twitter:title', content: title.substring(0, 69)},
      {property: 'twitter:description', content: desc.substring(0, 199)},
      {property: 'twitter:card', content: 'summary_large_image'},
      {property: 'twitter:image', content: canonicalImage},
    ];
    // end social sharing tags

    // generic link tags and apple touch icons
    const helmetLinks = [
      {rel: 'canonical', href: canonicalUrl},
      // favicon and apple icons handled automatically by electrode with PWA
      // For favicon, see /config/sw-config.js
      // { rel: 'apple-touch-icon', sizes: '180x180', href: icon },
      // { rel: 'icon', type: 'image/png', sizes: '32x32', href: icon },
      // { rel: 'icon', type: 'image/png', sizes: '16x16', href: icon },
      // { rel: 'manifest', href: `${host}images/icons/manifest.json` },
      // { rel: 'mask-icon', href: `${host}images/icons/safari-pinned-tab.svg`, color: '#00aba9' },
      // { rel: 'shortcut icon', href: icon },
    ];

    // const faviconMeta = [
    //   { name: 'msapplication-config', content: `${host}images/icons/browserconfig.xml` },
    //   { name: 'theme-color', content: '#00aba9' },
    // ];

    return (
      <Helmet
        titleTemplate={`%s, ${defaultTitle}`}
        defaultTitle={defaultTitle}
        meta={[
          ...fb,
          ...twitter,
          // ...faviconMeta,
        ]}
        link={[...helmetLinks]}
      >
        {/* base element */}
        <base href={base} />

        {/* character set */}
        <meta charSet="utf-8" />

        {/* title attributes and value */}
        <title lang="en">{title}</title>
        <meta name="description" content={desc} />

        (/* viewport */}
              <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        (/* canonical */}
        <link rel="canonical" href={canonicalUrl} />

        {/* block robot if not on .com or explicit noIndex */}
        {noIndex ? <meta name="robots" content="noindex" /> : null}

        {/* GTM */}
        {env !== 'development' ? (
          <script>
            {`
              (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
              (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
              m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
              })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

              ga('create', '${gtmId || 'XXX-XXXXXXX'}', 'auto');
              //ga('send', 'pageview');
            `}
          </script>
        ) : null}

        {children}
      </Helmet>
    );
  }
}

export default Head;
