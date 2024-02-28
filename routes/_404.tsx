import { FreshContext } from "$fresh/server.ts";

export function handler(req: Request, ctx: FreshContext) {
  // TODO: After configuraton stuff is sorted come back and replace this base url.
  return Response.redirect(new URL("/", "http://localhost:8000"));
}
