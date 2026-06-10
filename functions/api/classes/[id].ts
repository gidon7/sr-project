import type { Env } from "../../_lib/types";
import { makeCrud } from "../../_lib/crud";
import { paramId } from "../../_lib/data";

const crud = makeCrud({ table: "classes", fields: ["grade", "class_no", "homeroom", "note"] });

export const onRequestGet: PagesFunction<Env> = ({ env, request, params }) =>
  crud.getOne(env, request, paramId(params.id));
export const onRequestPut: PagesFunction<Env> = ({ env, request, params }) =>
  crud.update(env, request, paramId(params.id));
export const onRequestDelete: PagesFunction<Env> = ({ env, request, params }) =>
  crud.remove(env, request, paramId(params.id));
