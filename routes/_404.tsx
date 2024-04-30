import { FreshContext } from "$fresh/server.ts";
import config from "../lib/config.ts";

export function handler(req: Request, ctx: FreshContext) {
  return Response.redirect(new URL("/", config.host));
}
