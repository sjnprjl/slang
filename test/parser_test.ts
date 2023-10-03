import { Parser } from "../src/parser.ts";
import { Tokenizer } from "../src/tokenizer.ts";

const source = `
20 * (2 + 3)
`;

const lexer = new Tokenizer(source);
const parser = new Parser(lexer);
console.log(JSON.stringify(parser.program(), null, 2));
