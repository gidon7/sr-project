import type { Env } from "../../_lib/types";
import { makeCrud } from "../../_lib/crud";

const crud = makeCrud({
  table: "classes",
  fields: ["grade", "class_no", "homeroom", "note"],
  required: ["grade"],
});

export const onRequestGet: PagesFunction<Env> = ({ env, request }) => crud.list(env, request);
export const onRequestPost: PagesFunction<Env> = ({ env, request }) => crud.create(env, request);
