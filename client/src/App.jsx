import { Layout } from './shared/components';

function App() {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <section>
          <h1>API Playground</h1>
          <p className="text-muted mt-2">
            Build and test mock API endpoints with real-time request logging.
          </p>
        </section>

        <section className="bg-elevated p-6 rounded-lg border shadow-sm">
          <h2 className="mb-4">Getting Started</h2>
          <p className="text-muted">
            Create your first mock endpoint to start testing. Endpoints will appear here.
          </p>
        </section>
      </div>
    </Layout>
  );
}

export default App;
