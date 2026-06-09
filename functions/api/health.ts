/** Pages Function — GET /api/health */
import type { Env } from "../_lib/types";

export const onRequestGet: PagesFunction<Env> = async () => {
  return new Response(JSON.stringify({ status: "ok" }), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
};
