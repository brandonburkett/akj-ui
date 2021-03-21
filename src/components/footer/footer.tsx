import React, { StatelessComponent } from 'react';

// styles
import './footer.css';

/**
 * Block quote component
 */
const Footer: StatelessComponent = () => (
  <section className="group footer translate-z">
    <div className="attribute">&copy; {new Date().getFullYear()} Austin Komei Jyuku, LLC</div>
  </section>
);

export default Footer;
