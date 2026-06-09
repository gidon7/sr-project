import type { Env } from "../../_lib/types";
import { json } from "../../_lib/http";
import { deleteSession, clearCookie } from "../../_lib/auth";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  await deleteSession(env, request);
  return json({ ok: true }, 200, { "Set-Cookie": clearCookie() });
};
