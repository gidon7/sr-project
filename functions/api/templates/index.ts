import type { Env } from "../../_lib/types";
import { makeCrud } from "../../_lib/crud";

const crud = makeCrud({ table: "templates", fields: ["title", "content"], required: ["title"] });

export const onRequestGet: PagesFunction<Env> = ({ env, request }) => crud.list(env, request);
export const onRequestPost: PagesFunction<Env> = ({ env, request }) => crud.create(env, request);
