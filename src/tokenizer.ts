/*
 * Let's build a tokenizer
 */

import { keywords } from "./constants.ts";
import { Token, TokenType } from "./token.ts";
import { ITokenizer, makeLocation } from "./types.ts";

export class Tokenizer implements ITokenizer {
  cursor = 0;
  prev: Token | null = null;
  line = 1;
  lineStart = 0;

  constructor(private source: string) {}

  error(message: string) {
    throw message;
  }

  private get current() {
    return this.source[this.cursor];
  }

  private get peek() {
    if (this.iseof) this.error("Error: End of file");
    return this.source[this.cursor + 1];
  }

  private createToken(type: TokenType, lexeme: string) {
    return new Token(type, lexeme, {
      location: makeLocation(
        this.line,
        this.cursor,
        this.source.substring(this.lineStart, this.cursor),
      ),
    });
  }

  get islinebreak() {
    return this.current === "\n";
  }
  get iseof() {
    return this.cursor === this.source.length;
  }

  get eat() {
    if (this.iseof) this.error("Unexpected end of input.");
    if (this.current === "\n") {
      this.line++;
      this.lineStart = this.cursor;
    }
    return this.source[this.cursor++];
  }

  private get isint() {
    return /[0-9]/.test(this.current);
  }

  private get isplus() {
    return this.current === "+";
  }

  private get isminus() {
    return this.current === "-";
  }

  private get isws() {
    return this.current === " " || this.current === "\t";
  }

  private get isAssignment() {
    return this.current === "<" && this.peek === "-";
  }

  private get isarrow() {
    return this.current === "-" && this.peek === ">";
  }

  private get isalpha() {
    return /[a-z]/i.test(this.current);
  }
  private get isidentinitial() {
    return /[a-z_]/i.test(this.current);
  }

  tokenizeInt() {
    if (!this.isint) this.error("Expected int type token");

    let token = "";

    let foundDecimal = false;

    while (this.isint) {
      token += this.eat;
      if (this.current === "." && !foundDecimal) {
        foundDecimal = true;
        token += this.eat;
      }
    }

    return this.createToken(TokenType.number, token);
  }

  tokenizeHexString() {
    this.eat;
    this.eat;
    const hex = `${this.eat}${this.eat}`;
    const v = parseInt(hex, 16);
    return String.fromCharCode(v);
  }

  parseString() {
    let token = "";
    if (this.current !== '"' && this.current !== "'") {
      this.error("unexpected character.");
    }

    const start = this.eat;

    const escapeCharacterTable = {
      "\\n": "\n",
      "\\\\": "\\",
      "\\x": this.tokenizeHexString.bind(this),
    };

    while (this.current !== start && !this.iseof) {
      const t = `${this.current}${this.peek}`;
      const escapeCharacter =
        escapeCharacterTable[t as keyof typeof escapeCharacterTable];
      if (typeof escapeCharacter === "function") {
        token += escapeCharacter();
        continue;
      }
      if (escapeCharacter) {
        this.eat;
        this.eat;
        token += escapeCharacter;
        continue;
      }

      token += this.eat;
    }
    if (this.iseof) throw this.error("Unterminated string literal");
    this.eat;

    const t = this.createToken(TokenType.string, token);
    return t;
  }

  tokenizePlus() {
    if (!this.isplus) throw Error(`Error: Expected + got ${this.current}`);
    return this.createToken(TokenType.plus, this.eat);
  }

  tokenizeMinus() {
    if (!this.isminus) throw Error(`Error: Expected -, got ${this.current}`);
    if (this.isarrow) {
      this.eat;
      this.eat;
      return this.createToken(TokenType.arrow, "->");
    }
    return this.createToken(TokenType.minus, this.eat);
  }

  tokenizeId() {
    if (!this.isidentinitial) {
      throw Error(`Error: Unexpected character ${this.current}`);
    }
    let id = this.eat;
    while (this.isint || this.isalpha || this.isidentinitial) {
      if (this.iseof) break;
      id += this.eat;
    }

    const keyword = keywords[id as keyof typeof keywords];
    if (keyword) {
      return this.createToken(keyword, id);
    }

    return this.createToken(TokenType.id, id);
  }

  ignoreComment() {
    this.eat;
    this.eat;
    while (this.current !== "\n") {
      if (this.iseof) break;
      this.eat;
    }
  }

  // get next token
  get nextToken() {
    const cur = this._nextToken;
    this.prev = cur;
    return cur;
  }
  get _nextToken(): Token {
    while (!this.iseof) {
      if (this.isws) {
        this.eat;
        continue;
      }
      if (this.isint) return this.tokenizeInt();
      if (this.isplus) return this.tokenizePlus();
      if (this.isminus) return this.tokenizeMinus();
      if (this.current === "*") {
        return this.createToken(TokenType.mult, this.eat);
      }
      if (this.current === "/") {
        if (this.peek === "/") {
          this.ignoreComment();
        } else {
          return this.createToken(TokenType.div, this.eat);
        }
      }
      if (this.current === "!") {
        return this.createToken(TokenType.bang, this.eat);
      }
      if (this.current === ".") {
        return this.createToken(TokenType.dot, this.eat);
      }
      if (this.current === "%") {
        return this.createToken(TokenType.mod, this.eat);
      }

      if (this.current === "@") {
        return this.createToken(TokenType.global, this.eat); // awesome innit?
      }
      if (this.isidentinitial) return this.tokenizeId();

      if (this.current === "\n") {
        this.eat;
        return this.createToken(TokenType.nl, "\\n");
      }

      if (this.current === "<") {
        if (this.isAssignment) {
          this.eat;
          this.eat;
          return this.createToken(TokenType.assignment, "<-");
        }

        throw this.error("Unknown operator");
      }

      if (this.current === '"' || this.current === "'") {
        return this.parseString();
      }

      if (this.current === "(") {
        this.eat;
        return this.createToken(TokenType.leftParen, "(");
      }
      if (this.current === ")") {
        this.eat;
        return this.createToken(TokenType.rightParen, ")");
      }

      if (this.current === ",") {
        return this.createToken(TokenType.comma, this.eat);
      }

      if (this.current === "{") {
        return this.createToken(TokenType.leftCurlyBrace, this.eat);
      }

      if (this.current === "}") {
        return this.createToken(TokenType.rightCurlyBrace, this.eat);
      }

      this.error("Unexpected character token. " + this.current);
    }

    return this.createToken(TokenType.eof, "eof");
  }
}
