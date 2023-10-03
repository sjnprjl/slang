import { Expr } from "./ast.ts";
import { Environment } from "./environment.ts";

export class Interpreter {
  constructor(
    readonly ast: Expr,
    readonly global: Environment,
  ) { }

  interpret() {
    return this.ast.accept(this.global);
  }
}
