import {
  ArrayLiteral,
  AssignmentExpression,
  BinaryExpression,
  CallExpression,
  ClassExpression,
  Expr,
  FunctionExpression,
  Identifier,
  IfExpression,
  Literal,
  MemberExpression,
  Program,
  ReturnStatement,
  UnaryExpression,
  WhileExpression,
} from "./ast.ts";
import { Environment } from "./environment.ts";
import { TokenType } from "./token.ts";
import {
  LiteralReturnType,
  SlangArray,
  SlangCallable,
  SlangClass,
  SlangClassType,
} from "./types.ts";
import { makeCallable, zip } from "./utils.ts";

export function visitLiteral(ast: Literal) {
  return ast.value;
}

export function visitIdentifier(ast: Identifier, scope: Environment) {
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
  if (typeof ast.condition === "boolean" && ast.condition === true) {
    return evaluateList(ast.body, declaration);
  }

  if (ast.condition.accept(declaration)) {
    return evaluateList(ast.body, declaration);
  }

  if (!ast.elif) return null;

  return visitIfExpression(ast.elif, declaration);
}

export function visitFunctionExpression(
  ast: FunctionExpression,
  declaration: Environment,
) {
  const callable = makeCallable({
    arity: ast.params.length,

    call: (...args: unknown[]) => {
      const scope = new Environment({ parent: declaration });
      if (args.length !== ast.params.length) {
        throw `function expect ${ast.params.length} params, but got ${args.length}`;
      }

      zip(ast.params, args).map((v) => {
        const [param, arg] = v;
        scope.set((param as Identifier).token.lexeme, arg);
      });

      try {
        return evaluateList(ast.body, scope);
      } catch (err) {
        if ((err as ReturnStatement)?.kind !== "ReturnStatement") throw err;
        return (err as any).value;
      }
    },

    toString() {
      return ast.anonymous ? "<anonFn>" : `fn<${ast.id!.value}>`;
    },
  });

  if (ast.id) {
    declaration.set(ast.id.value, callable);
  }
  return callable;
}

export function visitAssignmentExpression(
  ast: AssignmentExpression,
  scope: Environment,
) {
  if (ast.id.kind === "MemberExpression") {
    const klass = ast.id as unknown as MemberExpression;
    const id = klass.id as unknown as Identifier;
    const classType = scope.get(id.value) as SlangClassType;
    const property = klass.member;
    return classType.set(property, ast.value, scope);
  }

  const variable = ast.id.value;
  const value = ast.value.accept(scope);

  if (ast.id.outer && scope.parent) {
    return scope.parent.set(variable, value);
  }

  return scope.set(variable, value);
}

export function visitMemberExpression(
  ast: MemberExpression,
  scope: Environment,
) {
  let inst = ast.id.accept(scope) as SlangClass;
  let member = ast.member;
  while (member) {
    inst = inst.get(member, scope) as SlangClass;
    member = member.member;
  }
  return inst;
}

export function visitCallExpression(
  ast: CallExpression,
  declaration: Environment,
  callable: SlangCallable | null = null,
) {
  const callee = ast.callee as Identifier; // TODO: make expression to be valid callee

  const _callable = callable ??
    (declaration.get(callee.value) as SlangCallable);

  if (_callable.kind !== "Callable") {
    throw `${callee.value} is not something we can call. We can only call function for now.`;
  }

  const args = ast.args.map((arg) => arg.accept(declaration));

  const result = _callable.call(...args);

  return result;
}

export function visitReturnStatement(ast: ReturnStatement, scope: Environment) {
  throw {
    kind: ast.kind,
    value: ast.ret == null ? null : ast.ret.accept(scope),
  };
}

export function visitArrayLiteral(ast: ArrayLiteral, scope: Environment) {
  const elements = ast.elements.map((element) => element.accept(scope));
  return new SlangArray(elements);
}

export function visitClassExpression(ast: ClassExpression, scope: Environment) {
  const identifier = ast.id.value;
  const klass = new SlangClass(identifier);
  scope.set(identifier, klass);
  return klass;
}

export function visitWhileExpression(ast: WhileExpression, scope: Environment) {
  let result = null;
  while (ast.booleanExpression.accept(scope)) {
    result = evaluateList(ast.body, scope);
  }
  return result;
}
