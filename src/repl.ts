import { Interpreter } from "./interpreter";
import { Parser } from "./parser";
import { Tokenizer } from "./tokenizer";

export class Repl {
  input() {
    //@ts-ignore Bun
    return process.stdout.write("> ");
  }

  eval(source: string) {
    const lexer = new Tokenizer(source);
    const parser = new Parser(lexer);
    const interpreter = new Interpreter(parser.program());
    return interpreter.ast.accept();
  }

  async run() {
    console.log("Slang :)");
    this.input();

    // @ts-ignore Because of Bun
    for await (const line of console) {
      if (line === "exit") break;
      console.log(this.eval(line));
      this.input();
    }
  }
}
