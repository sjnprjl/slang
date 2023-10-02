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
  le: TokenType.lt,
  fn: TokenType.fn,
  true: TokenType.boolean,
  false: TokenType.boolean,
} as const;
