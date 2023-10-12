import { Environment } from "./environment.ts";
import { Interpreter } from "./interpreter";

export class Repl {
  constructor(readonly global: Environment) { }

  input() {
    //@ts-ignore Bun
    return process.stdout.write("> ");
  }

  eval(source: string) {
    const interpreter = new Interpreter(source, this.global);
    return interpreter.interpret();
  }

  async run() {
    console.log("SLang v.0");
    this.input();

    // @ts-ignore Because of Bun
    for await (const line of console) {
      if (line === "exit") break;
      try {
        const out = this.eval(line);
        if (out !== undefined) console.log(out?.toString());
      } catch (err) {
        console.log(err);
      }
      this.input();
    }
  }
}
