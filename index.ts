import yargs from "yargs";

import { Repl } from "./src/repl.ts";
import { hideBin } from "./node_modules/yargs/build/lib/utils/process-argv.js";

const commands = yargs(hideBin(process.argv))
  .scriptName("slang")
  .command("<file>", "Slang interpreter", (yargs) => {
    yargs.positional("file", {
      describe: "file to interpret",
      type: "string",
    });
  })
  .help()
  .parse();

const file = commands["_"][0];

if (!file) {
  const repl = new Repl();
  repl.run();
}
