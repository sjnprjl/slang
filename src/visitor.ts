import { BinaryExpression, Identifier, Literal, Program } from "./ast.ts";
import { TokenType } from "./token.ts";
import { LiteralReturnType } from "./types.ts";

export function visitLiteral(ast: Literal) {
  return ast.value;
}

export function visitIdentifier(ast: Identifier) {
  return ast.value;
}

export function visitBinaryExpression(ast: BinaryExpression) {
  const left = ast.left.accept() as LiteralReturnType;
  const right = ast.right.accept() as LiteralReturnType;

  // TODO: there is a bug:
  if (left === null || right === null) return null;

  switch (ast.operator.symbol) {
    case TokenType.lt:
      return left < right;
    case TokenType.gt:
      return left > right;
    case TokenType.le:
      return left <= right;
    case TokenType.ge:
      return left >= right;
    case TokenType.eq:
      return left === right;
    case TokenType.neq:
      return left !== right;
    case TokenType.and:
      return left && right;
    case TokenType.or:
      return left || right;
    case TokenType.minus:
      return (left as number) - (right as number);
    case TokenType.plus:
      return (left as number) + (right as number);
    case TokenType.mult:
      return (left as number) * (right as number);
    case TokenType.div:
      return (left as number) / (right as number);
    case TokenType.mod:
      return (left as number) % (right as number);
    default:
      throw "unknwon binary expression";
  }
}

export function visitProgram(ast: Program) {
  let result = null;
  for (const stmt of ast.body) {
    if (stmt.kind === "EmptyStatement") continue;
    result = stmt.accept();
  }
  return result;
}
