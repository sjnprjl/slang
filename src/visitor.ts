import {
  AssignmentExpression,
  BinaryExpression,
  Expr,
  FunctionExpression,
  Identifier,
  IfExpression,
  Literal,
  MemberExpression,
  Program,
  UnaryExpression,
} from "./ast.ts";
import { Environment } from "./environment.ts";
import { TokenType } from "./token.ts";
import { LiteralReturnType } from "./types.ts";

export function visitLiteral(ast: Literal) {
  return ast.value;
}

export function visitIdentifier(ast: Identifier, scope: Environment) {
  if (ast.outer && scope.parent) {
    return scope.parent.resolve(ast.value);
  }
  return scope.resolve(ast.value);
}

export function visitBinaryExpression(
  ast: BinaryExpression,
  scope: Environment,
) {
  const left = ast.left.accept(scope) as LiteralReturnType;
  const right = ast.right.accept(scope) as LiteralReturnType;

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

export function evaluateList(statements: Expr[], scope: Environment) {
  let result = null;
  for (const stmt of statements) {
    if (stmt.kind === "EmptyStatement") continue;
    result = stmt.accept(scope);
  }
  return result;
}

export function visitProgram(ast: Program, scope: Environment) {
  return evaluateList(ast.body, scope);
}

export function visitUnaryExpression(ast: UnaryExpression, scope: Environment) {
  let result = null;

  switch (ast.operator.symbol) {
    case TokenType.minus: // TODO: numeric expression
      result = -(ast.expression.accept(scope) as number);
      break;
    case TokenType.plus: // TODO: numeric expression
      result = ast.expression.accept(scope) as number;
      break;
    case TokenType.bang: // TODO: boolean expression
      result = !ast.expression.accept(scope) as boolean;
      break;

    default:
      throw "Invalid unary operator";
  }

  return result;
}

export function visitIfExpression(ast: IfExpression, declaration: Environment) {
  const scope = new Environment({ parent: declaration });

  if (typeof ast.condition === "boolean" && ast.condition === true) {
    return evaluateList(ast.body, declaration);
  }

  if (ast.condition.accept(declaration)) return evaluateList(ast.body, scope);

  if (!ast.elif) return null;

  return visitIfExpression(ast.elif, declaration);
}

export function visitFunctionExpression(
  ast: FunctionExpression,
  scope: Environment,
) {
  // TODO:
  return null;
}

export function visitAssignmentExpression(
  ast: AssignmentExpression,
  scope: Environment,
) {
  const variable = ast.id.value;
  const value = ast.value.accept(scope);

  if (ast.id.outer && scope.parent) {
    return scope.parent.set(variable, value);
  }

  return scope.set(variable, value);
}

export function visitMemberExpression(ast: MemberExpression) {
  return ast;
}
