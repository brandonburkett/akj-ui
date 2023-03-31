import * as React from 'react';
import { Link } from 'react-router-dom';

// styles
import './nav.css';

// images
import imgMon from './images/komei-jyuku-mon-64.png';
import imgMenuClose from './images/menu-close.png';
import imgMenu from './images/menu.png';
import imgFacebook from './images/facebook.svg';
import imgYoutube from './images/youtube.svg';
import imgInstagram from './images/instagram.svg';

/**
 * Component state
 */
export interface IState {
  isOpen: boolean;
}

/**
 * Masthead and navigation
 */
class Nav extends React.PureComponent<{}, IState> {
  readonly menuRef: React.RefObject<HTMLDivElement>;

  constructor(props: {}) {
    super(props);

    // init state
    this.state = {
      isOpen: false,
    };

    // refs
    this.menuRef = React.createRef();

    // bind this to methods
    this.toggleMenu = this.toggleMenu.bind(this);
    this.resetMenu = this.resetMenu.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  // handle outside clicks to close
  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  // clean up
  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  toggleMenu(e: React.KeyboardEvent | React.MouseEvent) {
    if (
      e.type === 'click' ||
      (e.type === 'keydown' && (e as React.KeyboardEvent).key === 'Enter')
    ) {
      this.setState(state => ({
        isOpen: !state.isOpen,
      }));
    }
  }

  resetMenu() {
    this.setState({
      isOpen: false,
    });
  }

  /**
   * Close when clicking outside nav
   */
  handleClickOutside(e: MouseEvent) {
    const { isOpen } = this.state;
    const target = e.target as HTMLElement;

    if (this.menuRef && this.menuRef.current && !this.menuRef.current.contains(target) && isOpen) {
      this.resetMenu();
    }
  }

  render() {
    const { isOpen } = this.state;

    return (
      <header className="masthead translate-z" role="banner">
        <div className="brand">
          <Link to="/">
            <img src={imgMon} alt="Dojo homepage" />
            Austin Komei Jyuku
          </Link>
        </div>
        <nav
          className={`site-menu ${isOpen ? 'open' : ''}`}
          ref={this.menuRef}
          role="navigation"
          aria-label="Site Navigation"
        >
          <button
            className="menu-icon"
            onClick={this.toggleMenu}
            aria-expanded={isOpen}
            aria-controls="aria-menu-list"
          >
            <div className="menu-title">Menu</div>

            <img className="menu-open-img" src={imgMenu} alt="Open menu" />
            <img className="menu-close-img" src={imgMenuClose} alt="Close menu" />
          </button>
          <div id="aria-menu-list" className="menu-bar group" aria-hidden={!isOpen}>
            <ul id="nav-list" className="nav-list" role="menubar">
              <li className="nav-list-item">
                <Link className="nav-parent" to="/" role="menuitem" onClick={this.toggleMenu}>
                  Home
                </Link>
              </li>
              <li className="nav-list-item">
                <Link
                  className="nav-parent"
                  to="/iaijutsu"
                  role="menuitem"
                  onClick={this.toggleMenu}
                >
                  Iaijutsu
                </Link>
              </li>
              <li className="nav-list-item">
                <Link
                  className="nav-parent"
                  to="/schedule"
                  role="menuitem"
                  onClick={this.toggleMenu}
                >
                  Schedule
                </Link>
              </li>
              <li className="nav-list-item">
                <Link
                  className="nav-parent"
                  to="/seminars"
                  role="menuitem"
                  onClick={this.toggleMenu}
                >
                  Seminars
                </Link>
              </li>
              <li className="nav-list-item">
                <a className="nav-parent" href="mailto:brandon@komeijyuku.com" role="menuitem">
                  Contact
                </a>
              </li>
            </ul>
            <div className="social">
              <a
                className="social-link"
                href="https://www.facebook.com/austinkomeijyuku"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img className="social-icon" src={imgFacebook} alt="Facebook" />
              </a>
              <a
                className="social-link"
                href="https://www.instagram.com/austinkomeijyuku/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img className="social-icon" src={imgInstagram} alt="Instagram" />
              </a>
              <a
                className="social-link"
                href="http://www.youtube.com/user/austinkomeijyuku"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img className="social-icon" src={imgYoutube} alt="YouTube" />
              </a>
            </div>
          </div>
        </nav>
      </header>
    );
  }
}

export default Nav;
