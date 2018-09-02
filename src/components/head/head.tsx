/**
 * Dependencies
 */
import React, { PureComponent, ReactNode } from 'react';
import Helmet from 'react-helmet';

// image includes
import defaultOgpImage from './images/ogp-mon-1200-630.png';
import kamonImage from '../../styles/images/ogp-mon-375.jpg';

// import icon from '../styles/icons/icon-rightgift-green-192.png';

/**
 * Component props
 */
export interface IProps {
  base?: string;
  env?: string;
  gtmId?: string;
  title: string;
  desc: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  children?: ReactNode;
}

/**
 * Use helmet to setup a template for head tags for SEO.
 */
class Head extends PureComponent<IProps> {
  static defaultProps: Partial<IProps> = {
    // disable dynamic base tag since pre-rendering
    // base:
    //   typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '',
    base: process.env.REACT_APP_BASE || '',

    children: null,
    env: 'production',
    gtmId: process.env.REACT_APP_GA_ID || '',
    image: defaultOgpImage,
    noIndex: false,
  };

  render() {
    const { base, env, gtmId, title, desc, path, image, noIndex, children } = this.props;

    // default title if one is not provided
    const defaultTitle = 'Austin Komei Jyuku';
    const canonicalImage = `${image}`;

    // remove trailing slash (if present) for canonical url
    let canonicalUrl = `${base}${path.substring(1, path.length)}`;
    canonicalUrl = canonicalUrl.replace(/\/$/, '');

    return (
      <Helmet titleTemplate={`%s, ${defaultTitle}`} defaultTitle={defaultTitle}>
        {/* base element */}
        {/*<base href={base} />*/}
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
        {/* ogp tags - @see: http://ogp.me/ */}
        <meta property="og:site_name" content={defaultTitle} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={canonicalImage} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        {/* twitter tags - @see: https://dev.twitter.com/cards/markup */}
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={desc} />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:image" content={canonicalImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@akjdojo" />
        {/* iso app */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />
        <meta name="application-name" content="Austin Komei Jyuku" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <link rel="apple-touch-icon" href={kamonImage} />
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
