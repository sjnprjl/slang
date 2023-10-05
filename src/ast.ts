import { Environment } from "./environment.ts";
import { Token, TokenType } from "./token.ts";
import {
  visitArrayLiteral,
  visitAssignmentExpression,
  visitBinaryExpression,
  visitCallExpression,
  visitFunctionExpression,
  visitIdentifier,
  visitIfExpression,
  visitLiteral,
  visitMemberExpression,
  visitProgram,
  visitReturnStatement,
  visitUnaryExpression,
} from "./visitor.ts";

export type Kind =
  | "StringLiteral"
  | "NumberLiteral"
  | "BooleanLiteral"
  | "NullLiteral"
  | "Identifier"
  | "UnaryExpression"
  | "BinaryExpression"
  | "Operator"
  | "CallExpression"
  | "AssignmentExpression"
  | "MemberExpression"
  | "IfExpression"
  | "EmptyStatement"
  | "FunctionExpression"
  | "Callable"
  | "ReturnStatement"
  | "ArrayLiteral"
  | "Program";

export interface Acceptable {
  accept(ast: BaseAst, scope: Environment): unknown;
}

export interface AstFactoryOption extends Expr {
  kind: Kind;
}

export interface BaseAst extends Object {
  kind: Kind;
  token: Token | null;
}

export interface Expr extends BaseAst {
  accept(scope: Environment): unknown;
}

export interface Operator extends Expr {
  symbol: TokenType;
}

export interface ReturnStatement extends Expr {
  ret: Expr | null;
}

export interface ArrayLiteral extends Expr {
  elements: Expr[];
}

export interface UnaryExpression extends Expr {
  operator: Operator;
  expression: Expr;
}

export interface BinaryExpression extends Expr {
  left: Expr;
  operator: Operator;
  right: Expr;
}

export interface Literal extends Expr {
  kind: "StringLiteral" | "NumberLiteral" | "BooleanLiteral" | "NullLiteral";
  token: Token;
  value: string | number | boolean | null;
}

export interface Identifier extends Expr {
  kind: "Identifier";
  token: Token;
  value: string;
  outer: boolean;
}

export interface MemberExpression extends Expr {
  id: Expr;
  member: Expr;
}

export interface CallExpression extends Expr {
  callee: Expr;
  args: Expr[];
  part?: CallExpression;
}

export interface AssignmentExpression extends Expr {
  id: Expr; // TODO: member expression
  value: Expr;
}

export interface Program extends Expr {
  body: Expr[];
}

// deno-lint-ignore no-empty-interface
export interface EmptyStatement extends Expr { }

export interface IfExpression extends Expr {
  condition: Expr | true;
  body: Expr[];
  elif?: IfExpression;
}

export interface FunctionExpression extends Expr {
  id?: Identifier;
  anonymous: boolean;
  body: Expr[];
  params: Identifier[];
}

function asAcceptable<T extends Expr>(
  ast: Omit<T, "accept">,
  _accept: Acceptable["accept"],
): T {
  const _ast = { ...ast };

  return {
    ..._ast,
    accept(scope: Environment) {
      return _accept(ast, scope);
    },
  } as T;
}

export function astFactory<T extends Expr>(option: Omit<T, "accept">): T {
  switch (option.kind) {
    case "StringLiteral":
      return asAcceptable(
        { ...option, value: option.token!.lexeme },
        visitLiteral,
      );
    case "NumberLiteral":
      return asAcceptable(
        { ...option, value: +option.token!.lexeme },
        visitLiteral,
      );
    case "BooleanLiteral":
      return asAcceptable(
        {
          ...option,
          value: option.token!.lexeme === "true" ? true : false,
        },
        visitLiteral,
      );
    case "NullLiteral":
      return asAcceptable({ ...option, value: null }, visitLiteral);

    case "Identifier":
      return asAcceptable(
        { ...option, value: option.token!.lexeme },
        visitIdentifier,
      );

    case "BinaryExpression":
      return asAcceptable(option, visitBinaryExpression);
    case "AssignmentExpression":
      return asAcceptable(option, visitAssignmentExpression);
    case "UnaryExpression":
      return asAcceptable(option, visitUnaryExpression);
    case "Program":
      return asAcceptable(option, visitProgram);
    case "EmptyStatement":
      return asAcceptable(option, (ast: Expr) => ast);
    case "IfExpression":
      return asAcceptable(option, visitIfExpression);
    case "FunctionExpression":
      return asAcceptable(option, visitFunctionExpression);
    case "MemberExpression":
      return asAcceptable(option, visitMemberExpression);
    case "CallExpression":
      return asAcceptable(option, visitCallExpression);
    case "ReturnStatement":
      return asAcceptable(option, visitReturnStatement);
    case "ArrayLiteral":
      return asAcceptable(option, visitArrayLiteral);
    case "Operator":
      return asAcceptable(option, (ast: Expr) => ast);
    default:
      throw `Ast not implemented for ${option.kind}`;
  }
}

export function binaryAstBuilder(left: Expr, op: Token, right: Expr) {
  return astFactory<BinaryExpression>({
    kind: "BinaryExpression",
    token: null,
    left,
    right,
    operator: astFactory<Operator>({
      kind: "Operator",
      symbol: op.type,
      token: op,
    }),
  });
}
