import './Header.css';

export function Header() {
  return (
    <header className="header">
      <div className="header__container">
        <div className="header__brand">
          <svg
            className="header__logo"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <span className="header__title">API Playground</span>
        </div>

        <nav className="header__nav" aria-label="Main navigation">
          <ul className="header__nav-list" role="list">
            <li>
              <a href="/" className="header__nav-link header__nav-link--active">
                Endpoints
              </a>
            </li>
            <li>
              <a href="/tester" className="header__nav-link">
                Tester
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
