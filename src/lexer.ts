export const KEYWORDS = ['let', 'if']

export enum TokenType {
  Keyword, // 0
  Identifier, // 1
  Symbol, // 2
  Number, // 3
  String // 4
}

export function tokenTypeToString(type: TokenType): string {
  switch (type) {
    case TokenType.Keyword:
      return 'keyword'
    case TokenType.Identifier:
      return 'identifier'
    case TokenType.Symbol:
      return 'symbol'
    case TokenType.Number:
      return 'number'
    case TokenType.String:
      return 'string'
  }
}

export class Token {
  constructor(public type: TokenType, public value: string | number, public pos: Pos) {}
}

export interface Pos {
  i: number
  line: number
  col: number
}

export class Lexer {
  public pos: Pos = {i: -1, line: 0, col: -1}
  public currentChar: string = ''
  public tokens: Array<Token> = []

  public src: string
  public filename: string
  public lines: Array<string>

  constructor(src: string, filename: string) {
    this.src = src
    this.filename = filename
    this.lines = src.split('\n')
    this.advance()
  }

  private advance() {
    this.pos.i++
    if (this.pos.i < this.src.length) {
      this.currentChar = this.src[this.pos.i]
    } else {
      this.currentChar = ''
      return
    }
    if (this.currentChar !== '\n') {
      console.log('col++')
      this.pos.col++
    } else {
      console.log('line++')
      this.pos.line++
      this.pos.col = 0
    }
  }

  private makeNumber() {
    let buffer: string = ''
    let tmpPos: Pos = {...this.pos}
    while ('0123456789.'.includes(this.currentChar)) {
      buffer += this.currentChar
      this.advance()
    }
    this.tokens.push(new Token(TokenType.Number, parseFloat(buffer), tmpPos))
  }

  private makeText() {
    let buffer: string = ''
    let tmpPos: Pos = { ...this.pos}
    while ('_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.includes(this.currentChar)) {
      buffer += this.currentChar
      this.advance()
    }
    this.advance()
    if (KEYWORDS.includes(buffer)) {
      this.tokens.push(new Token(TokenType.Keyword, buffer, tmpPos))
    } else {
      this.tokens.push(new Token(TokenType.Identifier, buffer, tmpPos))
    }
  }

  private makeSymbol() {
    let buffer: string = ''
    let tmpPos: Pos = {...this.pos}
    while ('+-*/:;=(){}[]<>'.includes(this.currentChar)) {
      buffer += this.currentChar
      if (buffer === '//') {
        while (this.currentChar !== '\n') {
          this.advance()
        }
        this.advance()
        return
      }
      this.advance()
    }
    this.tokens.push(new Token(TokenType.Symbol, buffer, tmpPos))
  }

  private makeString() {
    this.advance()
    let buffer: string = ''
    let tmpPos: Pos = this.pos
    while (this.currentChar !== '"') {
      buffer += this.currentChar
      this.advance()
    }
    this.advance()
    this.tokens.push(new Token(TokenType.String, buffer, tmpPos))
  }

  public tokenize() {
    while (this.pos.i < this.src.length) {
      if (this.currentChar === '"') {
        this.makeString()
      } else if ('_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.includes(this.currentChar)) {
        this.makeText()
      } else if ('0123456789'.includes(this.currentChar)) {
        this.makeNumber()
      } else if (' \n\r\t'.includes(this.currentChar)) {
        this.advance()
      } else if ('+-*/:;=(){}[]<>'.includes(this.currentChar)) {
        this.makeSymbol()
      } else {
        throw new Error(`Unexpected character \`${this.currentChar}' at ${this.filename}:${this.pos.line}:${this.pos.col}`)
      }
    }
  }
}

export default function tokenize(src: string, filename: string): Array<Token> {
  let lexer = new Lexer(src, filename)
  lexer.tokenize()
  return lexer.tokens
}
