import { Token, TokenType } from "./token.ts";
import {
  visitBinaryExpression,
  visitIdentifier,
  visitLiteral,
  visitProgram,
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
  | "EmptyStatement"
  | "Program";

export interface Acceptable {
  accept(ast: BaseAst): unknown;
}

export interface AstFactoryOption extends BaseAst {
  kind: Kind;
}

export interface BaseAst {
  kind: Kind;
  token: Token | null;
}

export interface Expr extends BaseAst, AcceptableReturnType {}

export interface Operator extends BaseAst {
  symbol: TokenType;
}

export interface UnaryExpression extends BaseAst {
  operator: Operator;
  expression: BaseAst;
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
}
// deno-lint-ignore no-empty-interface
export interface IdentifierOpt extends Omit<Identifier, "value"> {}

export interface MemberExpression extends BaseAst {
  id: Expr;
  member?: MemberExpression;
}

export interface CallExpression extends BaseAst {
  callee: BaseAst;
  args: BaseAst[];
  part?: CallExpression;
}

export interface AssignmentExpression extends BaseAst {
  id: BaseAst;
  value: BaseAst;
}

export interface Program extends BaseAst {
  body: Expr[];
}

export interface EmptyStatement extends BaseAst {}

export type AcceptableReturnType = ReturnType<typeof asAcceptable>;

function asAcceptable<T extends BaseAst>(
  ast: T,
  _accept: Acceptable["accept"],
): T & { accept: () => ReturnType<Acceptable["accept"]> } {
  const _ast = { ...ast };

  return {
    ..._ast,
    accept() {
      return _accept(ast);
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
    case "CallExpression":
    case "MemberExpression":
    case "AssignmentExpression":
    case "UnaryExpression":
    case "Program":
      return asAcceptable(option, visitProgram);
    case "EmptyStatement":
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
    operator: {
      kind: "Operator",
      symbol: op.type,
      token: op,
    },
  });
}
