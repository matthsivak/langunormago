import {Token, TokenType, tokenTypeToString} from './lexer'

export enum NodeType {
  Var,
  Const,
  BinOp,
  MathOp,
  UnaryOp,
  If
}

export enum MathOpType {
  Addition,
  Subtraction,
  Multiplication,
  Division
}

export enum UnaryOpType {
  Not
}

export type Node = NodeBase | NodeVar | NodeConst | NodeMathOp | NodeIf

interface NodeBase {
  type: NodeType
}

interface NodeVar extends NodeBase {
  type: NodeType.Var
  name: string
  value: string | number | NodeMathOp
}

interface NodeConst extends NodeBase {
  type: NodeType.Const
  name: string
  value: string | number | MathOpType
}

interface NodeMathOp extends NodeBase {
  type: NodeType.MathOp
  members: Array<number | string>
  operators: Array<MathOpType>
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
    const tokensOfMathOp: Array<Token> = []
    // let
    this.advance()
    this.expectType(TokenType.Identifier)
    const name = this.currentToken.value
    if (typeof name !== 'string') throw new Error("Name of variable can't be number")

    // <name>
    this.advance()
    this.expectType(TokenType.Symbol)
    this.expectValue('=')
    // =
    this.advance()

    while (this.currentToken.value != ';') {
      tokensOfMathOp.push(this.currentToken)
      this.advance()
    }

    const operatorsOfMathOp: Array<MathOpType> = tokensOfMathOp
      .filter(token => token.type == TokenType.Symbol)
      .map((token): MathOpType => {
        if (token.value === '+') {
          return MathOpType.Addition
        } else if (token.value === '-') {
          return MathOpType.Subtraction
        } else if (token.value === '/') {
          return MathOpType.Division
        } else if (token.value === '*') {
          return MathOpType.Multiplication
        } else {
          throw new Error('Unexpected token at ' + token.pos)
        }
      })
    const membersOfMathOp = tokensOfMathOp.filter(token => token.type == TokenType.Number || token.type == TokenType.String)

    const node: NodeVar = {
      type: NodeType.Var,
      name: name,
      value: {
        type: NodeType.MathOp,
        members: membersOfMathOp.map(token => token.value),
        operators: operatorsOfMathOp
      }
    }
    this.tree.push(node)
    // <value>
  }

  public parse() {
    while (this.pos < this.tokens.length) {
      switch (this.currentToken.type) {
        case TokenType.Keyword:
          switch (this.currentToken.value) {
            case 'let':
              this.parseLet()
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
