import { BaseAst } from "./ast.ts";

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
}
