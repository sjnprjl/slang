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

export interface AstFactoryOption extends BaseAst {
  kind: Kind;
}

export interface BaseAst extends Object {
  kind: Kind;
  token: Token | null;
}

export interface Expr extends BaseAst, AcceptableReturnType {}

export interface Operator extends BaseAst {
  symbol: TokenType;
}

export interface ReturnStatement extends BaseAst {
  ret: Expr | null;
}

export interface ArrayLiteral extends BaseAst {
  elements: Expr[];
}

export interface UnaryExpression extends BaseAst {
  operator: Operator;
  expression: Expr;
}

export interface BinaryExpression extends BaseAst {
  left: Expr;
  operator: Operator;
  right: Expr;
}

export interface Literal extends BaseAst {
  kind: "StringLiteral" | "NumberLiteral" | "BooleanLiteral" | "NullLiteral";
  token: Token;
  value: string | number | boolean | null;
}

export interface Identifier extends BaseAst {
  kind: "Identifier";
  token: Token;
  value: string;
  outer: boolean;
}
// deno-lint-ignore no-empty-interface
export interface IdentifierOpt extends Omit<Identifier, "value"> {}

export interface MemberExpression extends BaseAst {
  id: Expr;
  member: Expr;
}

export interface CallExpression extends BaseAst {
  callee: Expr;
  args: Expr[];
  part?: CallExpression;
}

export interface AssignmentExpression extends BaseAst {
  id: Expr; // TODO: member expression
  value: Expr;
}

export interface Program extends BaseAst {
  body: Expr[];
}

// deno-lint-ignore no-empty-interface
export interface EmptyStatement extends BaseAst {}

export interface IfExpression extends BaseAst {
  condition: Expr | true;
  body: Expr[];
  elif?: IfExpression;
}

export interface FunctionExpression extends BaseAst {
  id?: Identifier;
  anonymous: boolean;
  body: Expr[];
  params: (IdentifierOpt & AcceptableReturnType)[];
}

export type AcceptableReturnType = ReturnType<typeof asAcceptable>;

function asAcceptable<T extends BaseAst>(
  ast: T,
  _accept: Acceptable["accept"],
): T & { accept: (scope: Environment) => ReturnType<Acceptable["accept"]> } {
  const _ast = { ...ast };

  return {
    ..._ast,
    accept(scope: Environment) {
      return _accept(ast, scope);
    },
  };
}

export function astFactory<T extends BaseAst>(
  option: T,
): T & AcceptableReturnType {
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
    operator: {
      kind: "Operator",
      symbol: op.type,
      token: op,
    },
  });
}
