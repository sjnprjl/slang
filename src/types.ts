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

export interface SlangClassType {
  get(prop: Expr, scope: Environment): unknown;
  set(field: Expr, value: Expr, scope: Environment): unknown;
}

export class SlangArray implements SlangClassType {
  constructor(readonly elements: any[]) { }
  set(field: Expr, value: Expr, scope: Environment): unknown {
    if (field.kind !== "NumberLiteral") {
      throw "array property should be numeric type.";
    }
    const num = field.accept(scope) as number;
    this.outboundCheck(num);
    this.elements[num] = value.accept(scope);
    return value.accept(scope);
  }

  toString() {
    return `{${this.elements.join(",")}}`;
  }

  outboundCheck(v: number) {
    if (v >= this.elements.length) throw "array out of bound error";
  }

  get(prop: Expr, scope: Environment) {
    if (prop.kind !== "NumberLiteral") {
      throw "member should be number literal";
    }
    const v = prop.accept(scope) as number;
    if (v >= this.elements.length) throw this.outboundCheck(v);
    return this.elements.at(v);
  }
}
