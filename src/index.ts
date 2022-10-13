#!/usr/bin/env bun run

import fs, {Stats} from 'fs'
import tokenize from './lexer'
import parse from './parser'

let argv: Array<string> = process.argv.slice(1)

let filename: string = argv[1]

if (filename) {
  try {
    const stat: Stats = fs.statSync(process.cwd() + '/' + filename)
    if (stat.isFile()) {
      const fileBuffer: Buffer = fs.readFileSync(process.cwd() + '/' + filename)
      let src: string = fileBuffer.toString()
      try {
        let tokens = tokenize(src, filename.split('/').slice(-1)[0])
        console.log(tokens)
        let ast = parse(tokens)
        console.log(ast)
      } catch (err: unknown) {
        console.log(err)
      }
    }
  } catch (err: unknown) {
    console.log(err)
    throw new Error('File not found')
  }
} else {
  throw new Error('File not found')
}
