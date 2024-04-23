import { parseArgs } from "https://deno.land/std@0.216.0/cli/mod.ts";

const DEFAULT_KEY_LENGTH = 64;

const args = parseArgs(Deno.args, {
  alias: { l: "length" },
  default: { length: DEFAULT_KEY_LENGTH },
});

const bytes = new Uint8Array(args.length / 2);
crypto.getRandomValues(bytes);
const key = bytes.reduce((str, i) => str + i.toString(16).padStart(2, "0"), "");

console.log(`Here's your key: ${key}`);
