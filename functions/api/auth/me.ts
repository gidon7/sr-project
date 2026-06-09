import type { Env } from "../../_lib/types";
import { json, unauthorized } from "../../_lib/http";
import { getUser } from "../../_lib/auth";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const user = await getUser(env, request);
  if (!user) return unauthorized();
  return json({ user: { id: user.id, email: user.email } });
};
