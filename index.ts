#!/bin/node

import yargs from "yargs";

import { Repl } from "./src/repl.ts";
import { hideBin } from "./node_modules/yargs/build/lib/utils/process-argv.js";
import { Interpreter } from "./src/interpreter.ts";
import { global } from "./src/stdlib.ts";

//@ts-ignore Bun
const commands = yargs(hideBin(process.argv))
  .scriptName("slang")
  .command("<file>", "Slang interpreter", (yargs: any) => {
    yargs.positional("file", {
      describe: "file to interpret",
      type: "string",
    });
  })
  .help()
  .parse();

//@ts-ignore :)
const file = commands["_"][0];

if (!file) {
  const repl = new Repl(global);
  repl.run();
} else {
  readFile(file)
    .then((source: string) => {
      const interpreter = new Interpreter(source, global);
      interpreter.interpret();
    })
    .catch((err) => {
      throw err;
    });
}

async function readFile(path: string) {
  //@ts-ignore Bun
  const file = Bun.file(path);

  return await file.text();
}
