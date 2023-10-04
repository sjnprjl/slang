import { Expr } from "./ast.ts";

export type LiteralReturnType = string | number | null | boolean;

export interface Location {
  row: number;
  col: number;
  lineContent: string;
}

export interface SlangCallable {
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
