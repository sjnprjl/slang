/*
 * TokenType enum
 */

export enum TokenType {
  /*
   * constants
   */

  number = "number",
  string = "string",
  boolean = "boolean",
  null = "nul",

  /*
   * keywords
   */

  if = "if",
  else = "else",
  elif = "elif",
  end = "end",
  fn = "fn",
  for = "for",
  while = "while",
  class = "class",

  lt = "lessThan", // <
  gt = "greaterThan", // >
  le = "lessThanOrEqual", // <=
  ge = "greaterThanOrEqual", // >=
  eq = "equal", // ===
  neq = "notEqual", // !==
  and = "and",
  or = "or",

  /*
   * arithmetic operators
   */

  minus = "minus", // -
  plus = "plus", // +
  mult = "mult", // *
  div = "div", // /
  mod = "mod", // %

  /*
   *  rest
   */

  arrow = "arrow", // "->"
  assignment = "assignment", // '<-'
  nl = "lineBreak", // \n

  leftParen = "lparen", // (
  rightParen = "rparen", // )

  comma = "comma", // ,

  eof = "eof", // <EOF>

  bang = "bang", // !

  dot = "dot", // .

  /*
   * identifier
   */
  id = "id",

  /*
   * outer scope accessor
   */
  global = "global",
}

interface TokenOption {
  line: number;
  column: number;

  // TODO:
  begin?: number;
  end?: number;
}

export class Token {
  constructor(
    readonly type: TokenType,
    readonly lexeme: string,
    readonly option: TokenOption,
  ) {}
}
