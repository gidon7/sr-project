export function json(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}

export function badRequest(message: string) {
  return json({ error: message }, 400);
}
export function unauthorized(message = "로그인이 필요합니다.") {
  return json({ error: message }, 401);
}
export function notFound(message = "찾을 수 없습니다.") {
  return json({ error: message }, 404);
}
export function serverError(message = "서버 오류가 발생했습니다.") {
  return json({ error: message }, 500);
}
