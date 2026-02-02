import { Header } from './Header';
import './Layout.css';

export function Layout({ children }) {
  return (
    <div className="layout">
      <Header />
      <main className="layout__main">
        <div className="layout__content">{children}</div>
      </main>
    </div>
  );
}

export default Layout;
