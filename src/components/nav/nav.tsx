import * as React from 'react';
import { Link } from 'react-router-dom';

// styles
import './nav.css';

// images
import imgMon from './images/komei-jyuku-mon-64.png';
import imgMenuClose from './images/menu-close.png';
import imgMenu from './images/menu.png';

/**
 * Component state
 */
export interface IState {
  isOpen: boolean;
}

/**
 * Masthead and navigation
 */
class Nav extends React.PureComponent<any, IState> {
  readonly menuRef: React.RefObject<HTMLDivElement>;

  constructor(props: any) {
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
      <header className="masthead group" role="banner">
        <div className="brand">
          <a href="/">
            <img src={imgMon} alt="Dojo homepage" />
            Austin Komei Jyuku
          </a>
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
                <Link className="nav-parent" to="/" role="menuitem">
                  Home
                </Link>
              </li>
              <li className="nav-list-item">
                <Link className="nav-parent" to="/iaijutsu" role="menuitem">
                  Iaijutsu
                </Link>
              </li>
              <li className="nav-list-item">
                <Link className="nav-parent" to="/naginatajutsu" role="menuitem">
                  Naginatajutsu
                </Link>
              </li>
              <li className="nav-list-item">
                <Link className="nav-parent" to="/seminars" role="menuitem">
                  Seminars
                </Link>
              </li>
              <li className="nav-list-item">
                <Link className="nav-parent" to="/schedule" role="menuitem">
                  Schedule
                </Link>
              </li>
              <li className="nav-list-item">
                <a
                  className="nav-parent"
                  href="http://www.cafepress.com/akjdojo"
                  target="_blank"
                  rel="noopener noreferrer"
                  role="menuitem"
                >
                  Shop
                </a>
              </li>
              <li className="nav-list-item">
                <a className="nav-parent" href="mailto:brandon@komeijyuku.com" role="menuitem">
                  Contact
                </a>
              </li>
            </ul>
            <div className="social">
              <a
                className="facebook"
                href="https://www.facebook.com/austinkomeijyuku"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="social-link">Facebook</div>
              </a>
              <a
                className="youtube"
                href="http://www.youtube.com/user/austinkomeijyuku"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="social-link">YouTube</div>
              </a>
              <a
                className="twitter"
                href="https://twitter.com/akjdojo"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="social-link">Twitter</div>
              </a>
              <a
                className="instagram"
                href="https://www.flickr.com/photos/austinkomeijyuku"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="social-link">Flickr</div>
              </a>
            </div>
          </div>
        </nav>
      </header>
    );
  }
}

export default Nav;
