import { Expr } from "./ast.ts";

export class Interpreter {
  constructor(readonly ast: Expr) { }

  interpret() {
    return this.ast.accept();
  }
}
