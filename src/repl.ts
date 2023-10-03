import { Interpreter } from "./interpreter";
import { Parser } from "./parser";
import { Tokenizer } from "./tokenizer";

export class Repl {
  private printAst = false;

  input() {
    //@ts-ignore Bun
    return process.stdout.write("> ");
  }

  eval(source: string) {
    const lexer = new Tokenizer(source);
    const parser = new Parser(lexer);
    const interpreter = new Interpreter(parser.program());
    if (this.printAst) {
      return JSON.stringify(interpreter.ast, null, 2);
    }
    return interpreter.ast.accept();
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
      console.log(this.eval(line));
      this.input();
    }
  }
}
