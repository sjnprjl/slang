import { describe, expect, it } from "bun:test";

import { Tokenizer } from "../src/tokenizer";

import { TokenType } from "../src/token";

describe("Tokenizer", () => {
  it("should tokenize integers", () => {
    const tokenizer = new Tokenizer("123 45.67 89");
    expect(tokenizer.nextToken.type).toBe(TokenType.number);
    expect(tokenizer.prev?.lexeme).toBe("123");
    expect(tokenizer.nextToken.type).toBe(TokenType.number);
    expect(tokenizer.prev?.lexeme).toBe("45.67");
    expect(tokenizer.nextToken.type).toBe(TokenType.number);
    expect(tokenizer.prev?.lexeme).toBe("89");
    expect(tokenizer.nextToken.type).toBe(TokenType.eof);
  });

  // Add more test cases to achieve high coverage
  //
  //

  it("should tokenize plus and minus operators", () => {
    const lexer = new Tokenizer("+ - ->");

    expect(lexer.nextToken.type).toBe(TokenType.plus);
    expect(lexer.prev?.lexeme).toBe("+");

    expect(lexer.nextToken.type).toBe(TokenType.minus);
    expect(lexer.prev?.lexeme).toBe("-");

    expect(lexer.nextToken.type).toBe(TokenType.arrow);
    expect(lexer.prev?.lexeme).toBe("->");

    expect(lexer.nextToken.type).toBe(TokenType.eof);
  });

  it("should tokenize identifiers and keywords", () => {
    const lexer = new Tokenizer("identifier if else");

    expect(lexer.nextToken.type).toBe(TokenType.id);
    expect(lexer.prev?.lexeme).toBe("identifier");

    expect(lexer.nextToken.type).toBe(TokenType.if);
    expect(lexer.prev?.lexeme).toBe("if");

    expect(lexer.nextToken.type).toBe(TokenType.else);
    expect(lexer.prev?.lexeme).toBe("else");

    expect(lexer.nextToken.type).toBe(TokenType.eof);
  });

  it("should tokenize strings", () => {
    const lexer = new Tokenizer("\"Hello, world!\" 'This is a string'");

    expect(lexer.nextToken.type).toBe(TokenType.string);
    expect(lexer.prev?.lexeme).toBe("Hello, world!");

    expect(lexer.nextToken.type).toBe(TokenType.string);
    expect(lexer.prev?.lexeme).toBe("This is a string");
  });

  it("should tokenize comment", () => {
    const lexer = new Tokenizer("// This is a comment");
  });

  it("should tokenize mixed input", () => {
    const lexer = new Tokenizer("x <- 42 + y");

    expect(lexer.nextToken.type).toBe(TokenType.id);
    expect(lexer.prev?.lexeme).toBe("x");

    expect(lexer.nextToken.type).toBe(TokenType.assignment);
    expect(lexer.prev?.lexeme).toBe("<-");

    expect(lexer.nextToken.type).toBe(TokenType.number);
    expect(lexer.prev?.lexeme).toBe("42");

    expect(lexer.nextToken.type).toBe(TokenType.plus);
    expect(lexer.prev?.lexeme).toBe("+");

    expect(lexer.nextToken.type).toBe(TokenType.id);
    expect(lexer.prev?.lexeme).toBe("y");

    expect(lexer.nextToken.type).toBe(TokenType.eof);
  });

  it("should tokenize line breaks", () => {
    const lexer = new Tokenizer("line1\nline2\n");

    lexer.nextToken;
    expect(lexer.nextToken.type).toBe(TokenType.nl);
    expect(lexer.prev?.lexeme).toBe("\\n");

    lexer.nextToken;
    expect(lexer.nextToken.type).toBe(TokenType.nl);
    expect(lexer.prev?.lexeme).toBe("\\n");

    expect(lexer.nextToken.type).toBe(TokenType.eof);
  });

  it("should tokenize assignmenextToken operator", () => {
    const lexer = new Tokenizer("<-");

    expect(lexer.nextToken.type).toBe(TokenType.assignment);
    expect(lexer.prev?.lexeme).toBe("<-");

    expect(lexer.nextToken.type).toBe(TokenType.eof);
  });

  it("should tokenize EOF", () => {
    const lexer = new Tokenizer("");

    expect(lexer.nextToken.type).toBe(TokenType.eof);
  });

  it("should handle whitespace", () => {
    const lexer = new Tokenizer("  \t  ");

    expect(lexer.nextToken.type).toBe(TokenType.eof);
  });

  it("should tokenize parenextTokenheses and comma", () => {
    const lexer = new Tokenizer("() ,");

    expect(lexer.nextToken.type).toBe(TokenType.leftParen);
    expect(lexer.prev?.lexeme).toBe("(");

    expect(lexer.nextToken.type).toBe(TokenType.rightParen);
    expect(lexer.prev?.lexeme).toBe(")");

    expect(lexer.nextToken.type).toBe(TokenType.comma);
    expect(lexer.prev?.lexeme).toBe(",");

    expect(lexer.nextToken.type).toBe(TokenType.eof);
  });
});
