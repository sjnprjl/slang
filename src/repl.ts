import { Environment } from "./environment.ts";
import { Interpreter } from "./interpreter";
import { Parser } from "./parser";
import { Tokenizer } from "./tokenizer";

export class Repl {
  private printAst = false;

  private global: Environment;

  constructor() {
    this.global = new Environment();
  }

  input() {
    //@ts-ignore Bun
    return process.stdout.write("> ");
  }

  eval(source: string) {
    const lexer = new Tokenizer(source);
    const parser = new Parser(lexer);
    const interpreter = new Interpreter(parser.program(), this.global);
    if (this.printAst) {
      return JSON.stringify(interpreter.ast, null, 2);
    }
    return interpreter.interpret();
  }

  async run() {
    console.log("Slang :)");
    this.input();

    // @ts-ignore Because of Bun
    for await (const line of console) {
      if (line === "exit") break;
      if (line === "ast") {
        this.printAst = true;
      }
      if (line === "noast") {
        this.printAst = false;
      }
      try {
        console.log(this.eval(line));
      } catch (err) {
        console.log(err);
      }
      this.input();
    }
  }
}
