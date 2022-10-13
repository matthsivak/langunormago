import {Token, TokenType, tokenTypeToString} from './lexer'

export enum NodeType {
  Var,
  Const,

  BinOp,
  UnaryOp,
  If
}

export enum BinOpType {
  Assign
}

export enum UnaryOpType {
  Not
}

export type Node = NodeBase | NodeVar | NodeConst | NodeBinOp | NodeIf

interface NodeBase {
  type: NodeType
}

interface NodeVar extends NodeBase {
  type: NodeType.Var
  name: string
}

interface NodeConst extends NodeBase {
  type: NodeType.Const
  value: string | number
}

interface NodeBinOp extends NodeBase {
  type: NodeType.BinOp
  opType: BinOpType
  left: NodeVar | NodeConst
  right: NodeVar | NodeConst
}

interface NodeIf extends NodeBase {
  type: NodeType.If
  condition: {
    type: NodeType
    opType: UnaryOpType
    left: NodeVar | NodeConst
    right: NodeVar | NodeConst
  }
  then: Array<Node>
}

class Parser {
  public pos: number = -1
  public currentToken: Token = new Token(TokenType.Identifier, 'idk', {i: 0, line: 0, col: 0})
  public tokens: Array<Token>
  public tree: Array<Node> = []

  constructor(tokens: Array<Token>) {
    this.tokens = tokens
    this.advance()
  }

  private advance() {
    this.pos++
    this.currentToken = this.tokens[this.pos]
  }

  private expectType(...types: Array<TokenType>) {
    if (!types.includes(this.currentToken.type)) {
      if (types.length === 1) {
        throw new Error(`Expected ${tokenTypeToString(types[0])}, got ${this.currentToken.type}`)
      } else {
        throw new Error(`Expected one of ${types.map(tokenTypeToString).join(', ')}, got ${this.currentToken.type}`)
      }
    }
  }

  private expectValue(...values: Array<string | number>) {
    if (!values.includes(this.currentToken.value)) {
      if (values.length === 1) {
        throw new Error(`Expected ${values[0]}, got ${this.currentToken.value}`)
      } else {
        throw new Error(`Expected one of ${values.join(', ')}, got ${this.currentToken.value}`)
      }
    }
  }

  private parseLet() {
    let buffer: Array<Token> = []
    // let
    this.advance()
    this.expectType(TokenType.Identifier)
    const name = this.currentToken.value
    // <name>
    this.advance()
    this.expectType(TokenType.Symbol)
    this.expectValue('=')
    // =
    this.advance()
    // TODO: parse expression
    console.log(buffer)
  }

  public parse() {
    while (this.pos < this.tokens.length) {
      switch (this.currentToken.type) {
        case TokenType.Keyword:
          switch (this.currentToken.value) {
            case 'let':
              this.parseLet()
              break
            case 'if':
              break
          }
          break
      }
      this.advance()
    }
  }
}

export default function parse(tokens: Array<Token>) {
  let p = new Parser(tokens)
  p.parse()
  return p.tree
}

/*
[
  {
    type: NodeType.BinOp,
    opType: BinOpType.Assign,
    left: {
      type: NodeType.Var,
      name: 'a',
    },
    right: {
      type: NodeType.Const,
      value: 1,
    },
  },
  {
    type: NodeType.If,
    condition: {
      type: NodeType.BinOp,
      opType: BinOpType.GreaterThan,
      left: {
        type: NodeType.Var,
        name: 'a',
      },
      right: {
        type: NodeType.Const,
        value: 0,
      },
    },
    then: [
      {
        type: NodeType.BinOp,
        opType: BinOpType.Assign,
        left: {
          type: NodeType.Var,
          name: 'a',
        },
        right: {
          type: NodeType.BinOp,
          opType: BinOpType.Sub,
          left: {
            type: NodeType.Var,
            name: 'a',
          },
          right: {
            type: NodeType.Const,
            value: 1,
          },
        },
      },
    ],
  },
]
*/

const randomData: Array<Token> = [
  {type: 0, value: 'let', pos: {i: 34, line: 2, col: 1}},
  {type: 1, value: 'x', pos: {i: 38, line: 2, col: 5}},
  {type: 2, value: '=', pos: {i: 40, line: 2, col: 7}},
  {type: 3, value: 10, pos: {i: 42, line: 2, col: 9}},
  {type: 2, value: ';', pos: {i: 44, line: 2, col: 11}}
  // {type: 0, value: 'if', pos: {i: 72, line: 7, col: 0}},
  // {type: 2, value: '(', pos: {i: 72, line: 7, col: 0}},
  // {type: 1, value: 'x', pos: {i: 72, line: 7, col: 0}},
  // {type: 2, value: '>', pos: {i: 72, line: 7, col: 0}},
  // {type: 3, value: 9, pos: {i: 72, line: 7, col: 0}},
  // {type: 2, value: ')', pos: {i: 72, line: 7, col: 0}},
  // {type: 2, value: '{', pos: {i: 72, line: 7, col: 0}},
  // {type: 1, value: 'x', pos: {i: 72, line: 7, col: 0}},
  // {type: 2, value: '=', pos: {i: 72, line: 7, col: 0}},
  // {type: 3, value: 8, pos: {i: 72, line: 7, col: 0}},
  // {type: 2, value: '}', pos: {i: 72, line: 7, col: 0}}
]

// console.log(parse(randomData))
