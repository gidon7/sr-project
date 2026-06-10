// 업로드 파일에서 텍스트 추출 (.txt 즉시, .pdf 는 pdfjs 동적 로드)
export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".txt")) {
    return (await file.text()).trim();
  }

  if (name.endsWith(".pdf")) {
    // 메인 번들 비대화 방지를 위해 PDF 선택 시에만 로드
    const pdfjs = (await import("pdfjs-dist")) as unknown as {
      GlobalWorkerOptions: { workerSrc: string };
      getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<PdfDoc> };
    };
    const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

    const data = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({ data }).promise;
    let text = "";
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
    }
    return text.trim();
  }

  throw new Error("txt 또는 pdf 파일만 지원합니다.");
}

interface PdfDoc {
  numPages: number;
  getPage: (n: number) => Promise<PdfPage>;
}
interface PdfPage {
  getTextContent: () => Promise<{ items: Array<{ str?: string }> }>;
}
