import { Parser } from 'acorn'
import jsx from 'acorn-jsx'
import { readFileSync } from 'fs'
const parser = Parser.extend(jsx())

console.log(JSON.stringify(parser.parse(readFileSync('./test.tsx', 'utf8'), {
    ecmaVersion: 'latest'
})));