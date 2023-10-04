import {
  AcceptableReturnType,
  ArrayLiteral,
  AssignmentExpression,
  astFactory,
  AstFactoryOption,
  binaryAstBuilder,
  CallExpression,
  EmptyStatement,
  Expr,
  FunctionExpression,
  Identifier,
  IdentifierOpt,
  IfExpression,
  Kind,
  MemberExpression,
  Program,
  ReturnStatement,
  UnaryExpression,
} from "./ast.ts";
import { Token, TokenType } from "./token.ts";
import { Tokenizer } from "./tokenizer.ts";
import { match } from "./utils.ts";

/*
 * Let's build parser
 */
export class Parser {
  private token: Token;

  constructor(readonly tokenizer: Tokenizer) {
    this.token = this.tokenizer.nextToken;
  }

  error(message: string, offset = 0) {
    const errorLine =
      `Error[${this.token.option.location.row}:${this.token.option.location.col}]: ${message}, but got ${this.token.lexeme} \n ${this.token.option.location.lineContent}`;

    throw `${errorLine}\n${
      " ".repeat(
        this.token.option.location.lineContent.length + offset,
      )
    }^`;
  }

  peek() {
    return this.token;
  }

  advance() {
    const current = this.peek();
    this.token = this.tokenizer.nextToken;
    return current;
  }

  check(type: TokenType) {
    return this.peek().type === type;
  }

  eat(type: TokenType, message: string) {
    if (this.check(type)) return this.advance();
    throw this.error(message);
  }

  match(...types: TokenType[]) {
    for (const type of types) {
      if (!this.check(type)) return false;
      this.advance();
    }
    return true;
  }

  createAst<T extends AstFactoryOption>(
    kind: Kind,
    rest?: Omit<T, "kind">,
  ): T & AcceptableReturnType {
    return astFactory<T>({ kind, token: null, ...rest } as T);
  }

  identifier() {
    const global = this.check(TokenType.global) && this.match(TokenType.global);
    if (this.check(TokenType.id)) {
      return this.createAst<IdentifierOpt>("Identifier", {
        token: this.advance(),
        outer: global,
      });
    }
    throw this.error(`Expected valid identifier token. got ${this.token.type}`);
  }

  isUnaryOperator() {
    return [TokenType.plus, TokenType.minus, TokenType.bang].some(
      (token) => token === this.peek().type,
    );
  }

  groupExpression() {
    this.eat(TokenType.leftParen, "( expected in group expression.");
    const expression = this.expression();
    this.eat(TokenType.rightParen, ") expected.");
    return expression;
  }

  primary() {
    switch (this.token.type) {
      case TokenType.string:
      case TokenType.number:
      case TokenType.boolean:
      case TokenType.null:
      case TokenType.leftCurlyBrace:
        return this.literal();
      case TokenType.id:
      case TokenType.global:
        return this.identifier();
      case TokenType.leftParen:
        return this.groupExpression();
      case TokenType.if:
        return this.ifExpression();
      default:
        throw this.error("invalid primary constant");
    }
  }

  unaryExpression(): Expr {
    if (!this.isUnaryOperator()) return this.leftHandExpression();

    const operator = this.eat(this.token.type, "");
    const expression = this.unaryExpression();

    return this.createAst<UnaryExpression>("UnaryExpression", {
      token: null,
      operator: {
        token: operator,
        symbol: operator.type,
        kind: "Operator",
      },
      expression,
    });
  }

  isMultplicativeOperator() {
    return [TokenType.mult, TokenType.div, TokenType.mod].some(
      (t) => t === this.peek().type,
    );
  }

  multiplicativeExpression(): Expr {
    const unaryExpression = this.unaryExpression();

    if (!this.isMultplicativeOperator()) return unaryExpression;
    const operator = this.eat(this.token.type, "");
    const right = this.multiplicativeExpression();

    return binaryAstBuilder(unaryExpression, operator, right);
  }

  additiveExpression(): Expr {
    const multiplicative = this.multiplicativeExpression();

    if (!match(this.peek().type, [TokenType.plus, TokenType.minus])) {
      return multiplicative;
    }
    const op = this.eat(this.token.type, "");
    const right = this.additiveExpression();

    return binaryAstBuilder(multiplicative, op, right);
  }

  relationalExpression(): Expr {
    const additive = this.additiveExpression();
    if (
      !match(this.token.type, [
        TokenType.le,
        TokenType.lt,
        TokenType.ge,
        TokenType.gt,
      ])
    ) {
      return additive;
    }

    return binaryAstBuilder(
      additive,
      this.advance(),
      this.relationalExpression(),
    );
  }

  equalityExpression(): Expr {
    const relationalExpression = this.relationalExpression();

    if (!match(this.token.type, [TokenType.eq, TokenType.neq])) {
      return relationalExpression;
    }

    return binaryAstBuilder(
      relationalExpression,
      this.advance(),
      this.equalityExpression(),
    );
  }

  logicalAndExpression(): Expr {
    const left = this.equalityExpression();
    if (!this.check(TokenType.and)) return left;

    return binaryAstBuilder(left, this.advance(), this.logicalAndExpression());
  }

  logicalOrExpression(): Expr {
    const left = this.logicalAndExpression();
    if (!this.check(TokenType.or)) return left;
    return binaryAstBuilder(left, this.advance(), this.logicalOrExpression());
  }

  conditionalExpression() {
    return this.logicalOrExpression();
  }

  memberExpressionPart(expr: Expr): MemberExpression & AcceptableReturnType {
    this.eat(TokenType.dot, ". expected");
    const property = this.property();

    return this.createAst<MemberExpression>("MemberExpression", {
      id: expr,
      member: property,
      token: null,
    });
  }

  functionParameterList(): ReturnType<typeof this.identifier>[] {
    const params: ReturnType<typeof this.identifier>[] = [];
    this.eat(TokenType.leftParen, "( expected");
    if (this.check(TokenType.rightParen) && this.match(TokenType.rightParen)) {
      return params;
    }

    params.push(this.identifier());

    while (this.check(TokenType.comma)) {
      this.advance();
      params.push(this.identifier());
    }
    this.eat(TokenType.rightParen, ") expected");
    return params;
  }

  functionExpression() {
    this.eat(TokenType.fn, "fn expect for function expression.");
    // anon func?

    let id: Token | undefined = undefined;

    if (this.check(TokenType.id)) {
      // named func
      id = this.advance();
    }

    const parameters = this.functionParameterList();
    const body = this.functionBody();

    return this.createAst<FunctionExpression>("FunctionExpression", {
      anonymous: !id,
      token: null,
      id: id
        ? this.createAst<Identifier>("Identifier", {
          outer: false,
          token: id,
          value: id.lexeme,
        })
        : undefined,
      params: parameters,
      body,
    });
  }

  functionBody() {
    const body = [];
    while (!this.check(TokenType.end) && !this.check(TokenType.eof)) {
      body.push(this.statement());
    }
    this.eat(TokenType.end, "function end expected");

    return body;
  }

  memberExpression(): Expr {
    if (this.check(TokenType.fn)) {
      // function expression
      return this.functionExpression();
    }

    const expr = this.primary();
    if (!this.check(TokenType.dot)) return expr;
    return this.memberExpressionPart(expr);
  }

  property() {
    switch (this.token.type) {
      case TokenType.id:
        return this.identifier();
      case TokenType.number:
      case TokenType.string:
        return this.literal();
      default:
        throw this.error("property access should be id, num, or string");
    }
  }

  callExpressionPart(callee: Expr): Expr {
    if (!this.check(TokenType.leftParen)) return callee;

    const part = this.createAst<CallExpression>("CallExpression", {
      token: null,
      callee,
      args: this.arguments(),
    });

    return this.callExpressionPart(part);
  }

  callExpression(): Expr {
    const callee = this.memberExpression();
    if (!this.check(TokenType.leftParen)) return callee;

    return this.callExpressionPart(callee);
  }

  arguments() {
    this.eat(TokenType.leftParen, "( expected");
    const args = this.argumentList();
    this.eat(TokenType.rightParen, ") expected.");
    return args;
  }

  argumentList(args = [] as Expr[]): Expr[] {
    if (this.check(TokenType.rightParen)) return args;
    const expr = this.assignmentExpression();
    args.push(expr);
    if (this.check(TokenType.comma)) {
      this.advance();
      return this.argumentList(args);
    }
    return args;
  }

  leftHandExpression(): Expr {
    const expr = this.callExpression();
    return expr;
  }

  assignmentExpression(): Expr {
    const left = this.conditionalExpression();
    if (!this.check(TokenType.assignment)) return left;
    this.eat(TokenType.assignment, "<- expected got " + this.peek().type);
    const expr = this.createAst<AssignmentExpression>("AssignmentExpression", {
      token: null,
      id: left as Expr,
      value: this.assignmentExpression(),
    });

    return expr;
  }

  expression() {
    const assignmentExpression = this.assignmentExpression();
    return assignmentExpression;
  }

  emptyStatement() {
    return this.createAst<EmptyStatement>("EmptyStatement", {
      token: this.eat(TokenType.nl, "empty statement should have linebreak."),
    });
  }

  expressionStatement() {
    const expression = this.expression();
    return expression;
  }

  end() {
    if (match(this.token.type, [TokenType.nl, TokenType.eof])) {
      this.eat(this.token.type, "");
      return;
    }
    throw this.error("statement end expected");
  }

  statement() {
    if (this.check(TokenType.nl)) return this.emptyStatement();
    if (this.check(TokenType.ret)) return this.returnStatement();
    return this.expressionStatement();
  }

  parse() {
    return this.program();
  }

  program(): Program & AcceptableReturnType {
    const expressions = [];

    while (!this.check(TokenType.eof)) {
      expressions.push(this.statement());
    }

    return this.createAst<Program>("Program", {
      body: expressions,
      token: null,
    });
  }

  ifExpressionBody() {
    const statements = [];

    if (!this.check(TokenType.arrow) && !this.check(TokenType.nl)) {
      throw this.error(
        `-> is expected for oneliner if expression or line break to enclose multi statement if.`,
        1,
      );
    }

    if (this.check(TokenType.arrow)) {
      this.advance();
      statements.push(this.statement());
      return statements;
    }

    while (
      !match(this.token.type, [TokenType.elif, TokenType.else, TokenType.end])
    ) {
      statements.push(this.statement());
    }
    return statements;
  }

  ifExpressionPart() {
    const condition = this.expression();
    const arrow = this.check(TokenType.arrow);
    const statements = this.ifExpressionBody();
    return {
      condition,
      statements,
      arrow,
    };
  }

  elifExpressionPart(
    ifExpr: IfExpression & AcceptableReturnType,
    arrow: boolean,
  ): IfExpression & AcceptableReturnType {
    if (this.check(TokenType.end)) {
      this.advance();
      return ifExpr;
    }
    if (this.check(TokenType.elif)) {
      this.advance();
      const { condition, statements, arrow } = this.ifExpressionPart();
      ifExpr.elif = this.elifExpressionPart(
        this.createAst<IfExpression>("IfExpression", {
          token: null,
          condition,
          body: statements,
        }),
        arrow,
      );
    }

    if (this.check(TokenType.else)) {
      this.advance();
      const arrow = this.check(TokenType.arrow);
      ifExpr.elif = this.createAst<IfExpression>("IfExpression", {
        token: null,
        condition: true,
        body: this.ifExpressionBody(),
      });

      if (!arrow) this.eat(TokenType.end, "end expected");
      return ifExpr;
    }

    if (!arrow) throw this.error("invalid elif expression");

    return ifExpr;
  }

  ifExpression(): IfExpression & AcceptableReturnType {
    this.eat(TokenType.if, "if expected.");

    const { condition, statements, arrow } = this.ifExpressionPart();

    const expr = this.createAst<IfExpression>("IfExpression", {
      token: null,
      condition: condition,
      body: statements,
    });
    const ifExpr = this.elifExpressionPart(expr, arrow);

    // why??
    return this.createAst<IfExpression>("IfExpression", {
      token: null,
      condition: ifExpr.condition,
      body: ifExpr.body,
      elif: ifExpr.elif,
    });
  }

  literal() {
    switch (this.peek().type) {
      case TokenType.number:
        return this.createAst("NumberLiteral", { token: this.advance() });
      case TokenType.string:
        return this.createAst("StringLiteral", { token: this.advance() });
      case TokenType.boolean:
        return this.createAst("BooleanLiteral", { token: this.advance() });
      case TokenType.null:
        return this.createAst("NullLiteral", { token: this.advance() });
      case TokenType.leftCurlyBrace:
        return this.array();
      default:
        throw this.error("Invalid literal value");
    }
  }

  array() {
    const elements = [];
    this.eat(TokenType.leftCurlyBrace, "{ expected.");
    while (!this.check(TokenType.rightCurlyBrace)) {
      elements.push(this.expression());
      if (!this.check(TokenType.rightCurlyBrace)) {
        this.eat(TokenType.comma, ", expected.");
      }
    }
    this.eat(TokenType.rightCurlyBrace, "} expected.");
    return this.createAst<ArrayLiteral>("ArrayLiteral", {
      elements,
      token: null,
    });
  }

  returnStatement() {
    this.eat(TokenType.ret, "ret statement expected");
    let expr: Expr | null = null;
    if (!this.check(TokenType.nl)) expr = this.expressionStatement();

    return this.createAst<ReturnStatement>("ReturnStatement", {
      token: null,
      ret: expr,
    });
  }
}
