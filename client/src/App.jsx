import { BrowserRouter, Routes, Route } from 'react-router';
import { Layout } from './shared/components';
import { DashboardPage, TesterPage } from './pages';
import { SocketProvider } from './features/request-log';

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tester" element={<TesterPage />} />
          </Routes>
        </Layout>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
