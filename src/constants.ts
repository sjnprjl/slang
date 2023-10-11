import { TokenType } from "./token";

export const keywords = {
  if: TokenType.if,
  else: TokenType.else,
  while: TokenType.while,
  for: TokenType.for,
  nul: TokenType.null,
  elif: TokenType.elif,
  gt: TokenType.gt,
  ge: TokenType.ge,
  lt: TokenType.lt,
  le: TokenType.le,
  fn: TokenType.fn,
  true: TokenType.boolean,
  false: TokenType.boolean,
  or: TokenType.or,
  and: TokenType.and,
  end: TokenType.end,
  eq: TokenType.eq,
  neq: TokenType.neq,
  ret: TokenType.ret,
  class: TokenType.class,
} as const;
