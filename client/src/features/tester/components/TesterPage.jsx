import { useApiTester } from '../useApiTester';
import { RequestForm } from './RequestForm';
import { HeadersEditor } from './HeadersEditor';
import { ResponseViewer } from './ResponseViewer';
import './TesterPage.css';

export function TesterPage() {
  const tester = useApiTester();

  return (
    <div className="tester-page">
      <header className="tester-page__header">
        <h1 className="tester-page__title">API Tester</h1>
        <p className="tester-page__subtitle">Send requests to your mock endpoints or any URL</p>
      </header>

      <div className="tester-page__content">
        <section className="tester-page__request">
          <RequestForm
            method={tester.method}
            url={tester.url}
            body={tester.body}
            onMethodChange={tester.setMethod}
            onUrlChange={tester.setUrl}
            onBodyChange={tester.setBody}
            onSend={tester.sendRequest}
            isLoading={tester.isLoading}
          />
          <HeadersEditor
            headers={tester.headers}
            onChange={tester.setHeaders}
          />
        </section>

        <section className="tester-page__response">
          <ResponseViewer
            response={tester.response}
            error={tester.error}
            isLoading={tester.isLoading}
          />
        </section>
      </div>
    </div>
  );
}
