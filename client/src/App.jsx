import { Layout } from './shared/components';
import { DashboardPage } from './pages';
import { SocketProvider } from './features/request-log';

function App() {
  return (
    <SocketProvider>
      <Layout>
        <DashboardPage />
      </Layout>
    </SocketProvider>
  );
}

export default App;
