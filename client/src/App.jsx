import { BrowserRouter, Routes, Route } from 'react-router';
import { Layout, ErrorBoundary, ToastProvider } from './shared/components';
import { DashboardPage, TesterPage } from './pages';
import { SocketProvider } from './features/request-log';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SocketProvider>
          <ToastProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/tester" element={<TesterPage />} />
              </Routes>
            </Layout>
          </ToastProvider>
        </SocketProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
