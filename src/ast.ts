import { Token, TokenType } from "./token.ts";

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
  | "Program";

export interface AstFactoryOption extends BaseAst {
  kind: Kind;
}

export interface BaseAst {
  kind: Kind;
  token: Token | null;
}

export interface Operator extends BaseAst {
  symbol: TokenType;
}

export interface UnaryExpression extends BaseAst {
  operator: Operator;
  expression: BaseAst;
}

export interface BinaryExpression extends BaseAst {
  left: BaseAst;
  operator: Operator;
  right: BaseAst;
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
export interface IdentifierOpt extends Omit<Identifier, "value"> { }

export interface MemberExpression extends BaseAst {
  id: Identifier;
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
  body: BaseAst[];
}

export function astFactory<T extends BaseAst>(option: T): T {
  switch (option.kind) {
    case "StringLiteral":
      return { ...option, value: option.token!.lexeme };
    case "NumberLiteral":
      return { ...option, value: +option.token!.lexeme };
    case "BooleanLiteral":
      return {
        ...option,
        value: option.token!.lexeme === "true" ? true : false,
      } as T;
    case "NullLiteral":
      return { ...option, value: null };

    case "Identifier":
      return { ...option, value: option.token!.lexeme };

    case "BinaryExpression":
    case "CallExpression":
    case "MemberExpression":
    case "AssignmentExpression":
    case "UnaryExpression":
    case "Program":
      return option;

    default:
      throw `Ast not implemented for ${option.kind}`;
  }
}

export function binaryAstBuilder(left: BaseAst, op: Token, right: BaseAst) {
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
