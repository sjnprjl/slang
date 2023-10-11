import { Environment } from "./environment.ts";
import { Parser } from "./parser.ts";
import { Tokenizer } from "./tokenizer.ts";

export class Interpreter {
  constructor(
    private readonly source: string,
    readonly global: Environment,
    private tokenizer = Tokenizer,
    private parser = Parser,
  ) { }

  interpret() {
    const tokenizer = new this.tokenizer(this.source);
    const parser = new this.parser(tokenizer);
    const parsed = parser.parse();
    return parsed.accept(this.global);
  }
}
