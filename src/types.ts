import {
  BaseAst,
  CallExpression,
  Expr,
  Identifier,
  Kind,
  Literal,
} from "./ast.ts";
import { Environment } from "./environment.ts";
import { Token } from "./token.ts";
import { makeCallable } from "./utils.ts";
import { visitCallExpression } from "./visitor.ts";

export type LiteralReturnType = string | number | null | boolean;

export interface ITokenizer {
  get nextToken(): Token;
}

export interface IParser {
  tokenizer: ITokenizer;

  parse(): BaseAst;
}

export interface Location {
  row: number;
  col: number;
  lineContent: string;
}

export interface SlangCallable extends Object {
  kind: Kind;
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

export interface SlangClassType {
  get(prop: Expr, scope: Environment): unknown;
  set(field: Expr, value: Expr, scope: Environment): unknown;
}

export class SlangInstance {
  constructor(private readonly klass: SlangClass) {}

  toString() {
    return `${this.klass.name} instance`;
  }
}

export class SlangClass implements SlangClassType, SlangCallable {
  methods = new Environment();
  kind: Kind;
  constructor(
    readonly name: string,
    readonly arity = 0,
  ) {
    this.kind = "Callable";
  }

  get(prop: Expr, scope: Environment): unknown {
    this.methods.setParent(scope);
    throw new Error("Method not implemented.");
  }
  set(field: Expr, value: Expr, scope: Environment): unknown {
    throw new Error("Method not implemented.");
  }

  call(...args: unknown[]): unknown {
    return new SlangInstance(this);
  }

  toString() {
    return this.name;
  }
}

export class SlangArray extends SlangClass {
  constructor(readonly elements: unknown[]) {
    super("Array");

    this.methods.set(
      "push",
      makeCallable({
        arity: 1,
        call: (elm: unknown) => {
          this.elements.push(elm);
        },
        toString: () => {
          return "push";
        },
      }),
    );
  }

  get value() {
    return this.elements;
  }
  get length() {
    return this.elements.length;
  }
  set(field: Expr, value: Expr, scope: Environment): unknown {
    if (field.kind !== "NumberLiteral" && field.kind !== "Identifier") {
      throw "array property should be numeric type or identifier.";
    }
    const num = field.accept(scope) as number;
    this.elements[num] = value.accept(scope);
    return value.accept(scope);
  }

  toString() {
    return `{${this.elements.join(",")}}`;
  }

  outboundCheck(v: number) {
    if (v >= this.elements.length) throw "array out of bound error";
  }

  get(prop: Expr, scope: Environment) {
    this.methods.setParent(scope);
    if (prop.kind === "CallExpression") {
      const method = this.methods.get(
        ((prop as CallExpression).callee as Identifier).value,
      ) as SlangCallable;
      return visitCallExpression(prop as CallExpression, this.methods, method);
    }

    const v = prop.accept(scope) as number;

    const elm = this.elements.at(v);
    if (elm === undefined) {
      throw `Cannot find element at index ${v} of array.`;
    }
    return elm;
  }
}

export class SlangStringClass extends SlangClass {
  constructor(readonly value: string) {
    super("String");
  }

  get(prop: Expr, scope: Environment) {
    this.methods.setParent(scope);
    if (prop.kind !== "NumberLiteral" && prop.kind !== "Identifier") {
      throw "property should only be numeric for string."; // todo: fix may be.
    }
    const v = prop.accept(scope) as number;
    const char = this.value.at(v);
    if (char === undefined) throw "cannot find character at index " + v;
    return char;
  }
  toString() {
    return this.value;
  }
  valueOf() {
    return this.value;
  }
}

export interface FileReader {
  read(path: string): Promise<string>;
}
