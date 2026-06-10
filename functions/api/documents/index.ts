import type { Env } from "../../_lib/types";
import { makeCrud } from "../../_lib/crud";

const crud = makeCrud({
  table: "documents",
  fields: ["title", "content"],
  required: ["title"],
  orderBy: "updated_at DESC",
  touchUpdatedAt: true,
});

export const onRequestGet: PagesFunction<Env> = ({ env, request }) => crud.list(env, request);
export const onRequestPost: PagesFunction<Env> = ({ env, request }) => crud.create(env, request);
