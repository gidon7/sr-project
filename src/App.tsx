import { useEffect, useState } from "react";
import "./App.css";

interface HelloResponse {
  message: string;
  runtime: string;
}

function App() {
  const [hello, setHello] = useState<HelloResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<HelloResponse>;
      })
      .then(setHello)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  return (
    <main className="container">
      <h1>sr-project</h1>
      <p className="subtitle">React + Vite frontend · Cloudflare Worker backend</p>

      <section className="card">
        <h2>Worker API check</h2>
        {error && <p className="error">API error: {error}</p>}
        {!error && !hello && <p>Loading from <code>/api/hello</code>…</p>}
        {hello && (
          <>
            <p className="message">{hello.message}</p>
            <p className="runtime">runtime: {hello.runtime}</p>
          </>
        )}
      </section>

      <p className="hint">
        Edit <code>src/App.tsx</code> for the UI, or <code>worker/index.ts</code> for the API.
      </p>
    </main>
  );
}

export default App;
