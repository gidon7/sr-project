import { Component, type ReactNode } from "react";

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="panel" style={{ margin: "1rem" }}>
          <h2 className="page-title" style={{ fontSize: "1.2rem" }}>
            화면을 표시하는 중 오류가 발생했습니다
          </h2>
          <p className="page-desc">아래 메시지를 알려주시면 바로 고치겠습니다.</p>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              fontSize: "0.8rem",
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              borderRadius: 8,
              padding: "0.8rem",
              color: "#be123c",
            }}
          >
            {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
