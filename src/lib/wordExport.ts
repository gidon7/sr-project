// HTML을 Word(.doc)로 내보낸다. 한글(HWP)에서도 .doc 열기로 불러올 수 있다.
export function downloadWord(filename: string, innerHtml: string, title = ""): void {
  const doc =
    `<html xmlns:o="urn:schemas-microsoft-com:office:office" ` +
    `xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">` +
    `<head><meta charset="utf-8"><title>${title}</title>` +
    `<style>body{font-family:'Malgun Gothic',sans-serif;line-height:1.7;} ` +
    `table{border-collapse:collapse;} td,th{border:1px solid #888;padding:4px 8px;}</style>` +
    `</head><body>${innerHtml}</body></html>`;
  const blob = new Blob(["﻿", doc], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".doc") ? filename : filename + ".doc";
  a.click();
  URL.revokeObjectURL(url);
}

/** 일반 텍스트를 간단한 HTML 문단으로 감싼다. */
export function textToHtml(title: string, text: string): string {
  const body = text
    .split(/\n+/)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
  return `<h2>${escapeHtml(title)}</h2>${body}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
