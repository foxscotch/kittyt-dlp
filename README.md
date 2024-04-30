# kittyt-dlp

Tiny web app for running predefined commands on the host machine remotely.
Intended for [yt-dlp], as you can probably tell from the name.

> [!CAUTION]\
> **Use at your own risk.** I am making a reasonable effort to try to keep this
> safe; e.g. allowing you to require a form of authentication, only allowing you
> to run software that is defined in the config file, escaping inputs. But one
> way or another, the stuff being passed here is going straight to a shell. This
> is inherently not-very-safe, no matter what measures I take.

> [!NOTE]\
> Currently nothing here works as intended. This is....... documentation-driven
> development. Surely that is an established thing. In any case, this notice
> will be removed when all of the options are implemented successfully.

## About

You can start the server with `deno task start`. If you need to use a different
port than 8000, set the `PORT` environment variable to whatever port you want.

A [config.toml](./config.toml) file is included with a basic configuration. It
contains the same configuration as in the
[Example configuration file](#example-configuration-file) section below. At
least, it should. If I let it get out of date, that's my bad. Feel free to let
me know.

It was made, as mentioned, to be used with [yt-dlp], but there's nothing
stopping you from using it for running something else. It should be flexible
enough. Do whatever you want.

[yt-dlp]: https://github.com/yt-dlp/yt-dlp

## Configuration

Configuration is done with [TOML](https://toml.io/en/v1.0.0). See
[below](#example-configuration-file) for an example configuration file.

### Top-level options

These are the options that govern the general behavior of the software.

| Option               | Type    | Default    | Description                                                                                                                                                                                                  |
| -------------------- | ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| host                 | string  | _required_ | Hostname (plus protocol and port) that the app is running under; e.g. `http://localhost:8000` or `https://foxscotch.net`. Don't include a final slash.                                                       |
| secret               | string  | null       | Secret used as a flimsy form of auth. Hope you're running this behind TLS. It can be pretty much any string, but I'd suggest using a randomly generated string. I've provided [a script] for generating one. |
| storeSecretInCookies | boolean | true       | Whether to store the secret as a cookie for convenience.                                                                                                                                                     |
| allowUserOptions     | boolean | false      | Whether to allow a user to add new options to be passed. If this is set to false, no command will allow user defined options, period. The matching setting on a specific command is ignored in that case.    |

[a script]: #generating-a-secret

### Commands

Commands are defined as TOML array tables, under `[[commands]]` keys:

| Option               | Type                       | Default        | Description                                                                                                                                                                                                                                   |
| -------------------- | -------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name                 | string                     | _required_     | Name of the command, shown in the UI.                                                                                                                                                                                                         |
| command              | string                     | _required_     | Command to be run; only the first part, no options.                                                                                                                                                                                           |
| multipleInputSchemes | string (see desc)          | finalArguments | How multiple inputs should be passed to the program being run. See the next section for more information about the available values and what they mean.                                                                                       |
| options              | array&lt;array&lt;string>> | empty          | Options to be passed to the command, represented as an array of arrays of pairs of strings. The second in a pair is optional if it's an empty option. Kind of hard to explain in more detail, so just look at the example configuration file. |
| allowUserOptions     | boolean                    | false          | Like in the matching top level option, this determines whether users can add new options to be passed. Ignored if the top level setting is false.                                                                                             |
| maxSubprocesses      | integer                    | 3              | (Only applies to `multipleInputSchemes=multipleCalls`) Maximum number of subprocesses that should be alive at a single time.                                                                                                                  |

Options will be passed as-written. If you include the `--` at the beginning, it
will be included. If you don't, it will not. It's just easier for me to write
the code if I do it this way.

### Multiple-input schemes

The `multipleInputScheme` option determines how multiple inputs will be passed
to the command. Like, if you have a list of URLs, depending on the program being
run, it could vary whether you need to pass multiple arguments, run the command
multiple times, etc.

| Scheme         | Description                                                                                                                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| finalArguments | Pass each input as an additional final argument, like `yt-dlp input1 input2 input3`.                                                                                                                                     |
| multipleCalls  | Run a new instance of the command for each input, e.g. `yt-dlp input1 & yt-dlp input2 & yt-dlp input3`. It won't actually be run like that (they'll be spawned as separate processes), but you get the idea.             |
| asOptions      | Passed as options. I'm not sure if this is realistically needed, but you never know. You probably wouldn't want to also define this option as an option, but I dunno. You could. `yt-dlp -i input1 -i input2 -i input3`. |
| none           | Will only allow a single input.                                                                                                                                                                                          |

### Example configuration file

```toml
host = "http://localhost:8000"
secret = "abc123"
storeSecretInCookies = true

[[commands]]

name = "YouTube"
command = "yt-dlp"
options = [
  ["--output",         "%(uploader)s - %(title)s - %(id)s"],
  ["--format",         "bestvideo*+bestaudio/best"        ],
  ["--no-overwrites"                                      ],
  ["--sub-langs",      "all,-live_chat"                   ],
  ["--embed-subs"                                         ],
  ["--throttled-rate", "1M"                               ]
]

[[commands]]

name = "General yt-dlp"
command = "yt-dlp"
options = [
  ["--format", "bestvideo*+bestaudio/best"],
  ["--no-overwrites"]
]
```

This defines two commands, which would be run like these, respectively:

```shell
yt-dlp \
  --output "%(uploader)s - %(title)s - %(id)s" \
  --format "bestvideo*+bestaudio/best" \
  --no-overwrites \
  --sub-langs "all,-live_chat" \
  --embed-subs \
  --throttled-rate "1M" \
  $input

yt-dlp \
  --format "bestvideo*+bestaudio/best" \
  --no-overwrites \
  $input
```

### Generating a secret

You can really use any string you'd like for the secret. My recommendation would
be a random password generated by a password manager. However, for convenience,
this repo includes a script for generating one made of hexadecimal characters.
Because random arbitrary characters would take more work. So hex it is.

You can run it with `deno task generate-secret`. Or just
`deno run generate-secret.ts`. It defaults to 64 characters, but if you'd like,
you can pass a specific length with the argument `-l`/`--length`. It will be
rounded down to the nearest even number, just because of the way `Uint8Array`
works.
