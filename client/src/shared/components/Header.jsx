import { NavLink } from 'react-router';
import { Terminal } from 'lucide-react';
import './Header.css';

export function Header() {
  return (
    <header className="header">
      <div className="header__container">
        <div className="header__brand">
          <Terminal size={24} className="header__logo" aria-hidden="true" />
          <span className="header__title">API Playground</span>
        </div>

        <nav className="header__nav" aria-label="Main navigation">
          <ul className="header__nav-list" role="list">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `header__nav-link${isActive ? ' header__nav-link--active' : ''}`
                }
              >
                Endpoints
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/tester"
                className={({ isActive }) =>
                  `header__nav-link${isActive ? ' header__nav-link--active' : ''}`
                }
              >
                Tester
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
