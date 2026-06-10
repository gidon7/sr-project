import type { Env } from "./types";
import { getUser } from "./auth";
import { json, unauthorized, badRequest, notFound } from "./http";

interface CrudOptions {
  table: string;
  fields: string[]; // 사용자 편집 가능 컬럼
  required?: string[];
  orderBy?: string; // 기본 created_at DESC
  touchUpdatedAt?: boolean; // update 시 updated_at 갱신
}

/** user_id 소유권이 적용된 표준 CRUD 핸들러 묶음. */
export function makeCrud(opts: CrudOptions) {
  const order = opts.orderBy ?? "created_at DESC";

  async function list(env: Env, request: Request) {
    const user = await getUser(env, request);
    if (!user) return unauthorized();
    const { results } = await env.DB.prepare(
      `SELECT * FROM ${opts.table} WHERE user_id = ? ORDER BY ${order}`,
    )
      .bind(user.id)
      .all();
    return json({ items: results });
  }

  async function create(env: Env, request: Request) {
    const user = await getUser(env, request);
    if (!user) return unauthorized();
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return badRequest("유효한 JSON 본문이 필요합니다.");
    }
    for (const r of opts.required ?? []) {
      if (!String(body[r] ?? "").trim()) return badRequest(`'${r}' 항목이 필요합니다.`);
    }
    const cols = ["user_id", ...opts.fields];
    const vals = [user.id, ...opts.fields.map((f) => (body[f] ?? null) as unknown)];
    const ph = cols.map(() => "?").join(", ");
    const res = await env.DB.prepare(
      `INSERT INTO ${opts.table} (${cols.join(", ")}) VALUES (${ph})`,
    )
      .bind(...vals)
      .run();
    const item = await env.DB.prepare(`SELECT * FROM ${opts.table} WHERE id = ?`)
      .bind(Number(res.meta.last_row_id))
      .first();
    return json({ item });
  }

  async function getOne(env: Env, request: Request, id: number) {
    const user = await getUser(env, request);
    if (!user) return unauthorized();
    const item = await env.DB.prepare(`SELECT * FROM ${opts.table} WHERE id = ? AND user_id = ?`)
      .bind(id, user.id)
      .first();
    if (!item) return notFound();
    return json({ item });
  }

  async function update(env: Env, request: Request, id: number) {
    const user = await getUser(env, request);
    if (!user) return unauthorized();
    const existing = await env.DB.prepare(
      `SELECT id FROM ${opts.table} WHERE id = ? AND user_id = ?`,
    )
      .bind(id, user.id)
      .first();
    if (!existing) return notFound();
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return badRequest("유효한 JSON 본문이 필요합니다.");
    }
    const setCols = opts.fields.filter((f) => f in body);
    if (setCols.length === 0 && !opts.touchUpdatedAt) return badRequest("변경할 내용이 없습니다.");
    const setSql = setCols.map((f) => `${f} = ?`);
    if (opts.touchUpdatedAt) setSql.push("updated_at = datetime('now')");
    const vals = setCols.map((f) => (body[f] ?? null) as unknown);
    await env.DB.prepare(`UPDATE ${opts.table} SET ${setSql.join(", ")} WHERE id = ?`)
      .bind(...vals, id)
      .run();
    const item = await env.DB.prepare(`SELECT * FROM ${opts.table} WHERE id = ?`).bind(id).first();
    return json({ item });
  }

  async function remove(env: Env, request: Request, id: number) {
    const user = await getUser(env, request);
    if (!user) return unauthorized();
    const existing = await env.DB.prepare(
      `SELECT id FROM ${opts.table} WHERE id = ? AND user_id = ?`,
    )
      .bind(id, user.id)
      .first();
    if (!existing) return notFound();
    await env.DB.prepare(`DELETE FROM ${opts.table} WHERE id = ?`).bind(id).run();
    return json({ ok: true });
  }

  return { list, create, getOne, update, remove };
}
