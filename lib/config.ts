// deno-lint-ignore-file no-explicit-any -- need any for unpredictable TOML inputs

import { parse } from "https://deno.land/std@0.216.0/toml/mod.ts";

const multipleInputSchemes = [
  "finalArguments",
  "multipleCalls",
  "asOptions",
  "none",
] as const;
type MultipleInputScheme = typeof multipleInputSchemes[number];

type Command = {
  name: string;
  command: string;
  multipleInputScheme: MultipleInputScheme;
  options: string[][];
  allowUserOptions: boolean;
  maxSubprocesses: number;
};

type Options = {
  host: URL;
  secret: string | null;
  storeSecretInCookies: boolean;
  allowUserOptions: boolean;
  commands: Command[];
};

function required(name: string, value: any) {
  if (typeof value === "undefined") {
    throw new Error(`${name} option is required`);
  }

  return value;
}

/** Transform individual command options into usable representations. */
function transformCommand(options: Record<string, any>): Command {
  return {
    name: required("command:name", options.name),
    command: required("command:command", options.command),
    multipleInputScheme: ((scheme) => {
      if (typeof scheme === "undefined") {
        return "finalArguments";
      } else if (multipleInputSchemes.includes(scheme)) {
        return scheme;
      }
      throw new Error(`${scheme} is not a valid multiple-input scheme`);
    })(options.multipleInputScheme),
    options: options.options,
    allowUserOptions: !!options.allowUserOptions,
    maxSubprocesses: parseInt(options.maxSubprocesses ?? 3),
  };
}

/** Transform individual options into usable representations. */
function transformOptions(options: Record<string, any>): Options {
  return {
    host: new URL(required("host", options.host)),
    secret: options.secret ?? null,
    storeSecretInCookies: !!options.storeSecretInCookies,
    allowUserOptions: !!options.allowUserOptions,
    commands: options.commands.map((cmd: any) => transformCommand(cmd)),
  };
}

const configFile = parse(Deno.readTextFileSync("./config.toml"));

export default transformOptions(configFile);
