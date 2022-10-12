#!/usr/bin/env ts-node

import fs, {fstat, Stats} from 'fs'
import tokenize from './lexer'

let argv: Array<string> = process.argv.slice(1)

let filename: string = argv[1]

if (filename) {
  try {
    const stat: Stats = fs.statSync(process.cwd() + '/' + filename)
    if (stat.isFile()) {
      const fileBuffer: Buffer = fs.readFileSync(process.cwd() + '/' + filename)
      let src: string = fileBuffer.toString()
      try {
        console.log(tokenize(src, filename))
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
