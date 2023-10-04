import { BaseAst, Expr } from "./ast.ts";
import { Environment } from "./environment.ts";

export type LiteralReturnType = string | number | null | boolean;

export interface Location {
  row: number;
  col: number;
  lineContent: string;
}

export interface SlangCallable extends BaseAst {
  arity: number;
  call(...args: unknown[]): unknown;
}

export const makeLocation = (
  row: number,
  col: number,
  lineContent: string,
): Location => ({
  row,
  col,
  lineContent,
});

export class SlangArray extends Array {
  constructor(
    readonly elements: any[],
    length: number,
  ) {
    super(length);
  }

  toString() {
    return `{${this.elements.join(",")}}`;
  }

  get(prop: Expr, scope: Environment) {
    if (prop.kind !== "NumberLiteral") {
      throw "member should be number literal";
    }
    const v = prop.accept(scope) as number;
    if (v >= this.length) throw "array bound error";
    return this.elements.at(v);
  }
}
