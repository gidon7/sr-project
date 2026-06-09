import type { AnalysisResult, AnalyzeRequest } from "./types";

export async function analyze(req: AnalyzeRequest): Promise<AnalysisResult> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(req),
  });

  const data = (await res.json().catch(() => null)) as
    | { result?: AnalysisResult; error?: string }
    | null;

  if (!res.ok || !data) {
    throw new Error(data?.error ?? `요청 실패 (HTTP ${res.status})`);
  }
  if (!data.result) {
    throw new Error(data.error ?? "분석 결과가 비어 있습니다.");
  }
  return data.result;
}
