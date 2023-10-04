import { describe, expect, it } from "bun:test";
import { Parser } from "../src/parser";
import { Tokenizer } from "../src/tokenizer.ts";
describe("Parser", () => {
  it("should parse a simple addition expression", () => {
    const input = "1 + 2";
    const lexer = new Tokenizer(input);
    const parser = new Parser(lexer);
    const ast = parser.program();
    expect(ast.kind).toEqual("Program");
    expect(ast.body.length).toEqual(1);
  });
});
