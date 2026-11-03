export type Op = '+' | '−' | '×' | '÷'
export const operations: Op[] = ['+', '−', '×', '÷']
export interface Fraction { n: number; d: number }
export interface Tile { id: string; value: Fraction; expression: string }
export interface Move { a: Tile; b: Tile; op: Op; result: Tile }
function gcd(a: number, b: number): number { return b ? gcd(b, a % b) : Math.abs(a) }
export function fraction(n: number, d = 1): Fraction {
  if (!d) throw new Error('不能除以 0')
  const g = gcd(n, d) || 1
  return { n: n / g * Math.sign(d), d: Math.abs(d) / g }
}
export function calculate(a: Fraction, b: Fraction, op: Op): Fraction {
  switch (op) {
    case '+': return fraction(a.n * b.d + b.n * a.d, a.d * b.d)
    case '−': return fraction(a.n * b.d - b.n * a.d, a.d * b.d)
    case '×': return fraction(a.n * b.n, a.d * b.d)
    case '÷': return fraction(a.n * b.d, a.d * b.n)
  }
}
export function display(v: Fraction): string { return v.d === 1 ? String(v.n) : `${v.n}/${v.d}` }
export function combine(a: Tile, b: Tile, op: Op): Tile {
  return { id: `(${a.id}${op}${b.id})`, value: calculate(a.value, b.value, op), expression: `(${a.expression} ${op} ${b.expression})` }
}
export function makeTiles(numbers: number[]): Tile[] { return numbers.map((n, i) => ({ id: String(i), value: fraction(n), expression: String(n) })) }
export function solve(tiles: Tile[], failed = new Set<string>()): Move[] | null {
  if (tiles.length === 1) return tiles[0]!.value.n === 10 * tiles[0]!.value.d ? [] : null
  const key = tiles.map(t => display(t.value)).sort().join(',')
  if (failed.has(key)) return null
  for (let i = 0; i < tiles.length; i++) for (let j = 0; j < tiles.length; j++) {
    if (i === j) continue
    const a = tiles[i]!, b = tiles[j]!
    for (const op of operations) {
      if ((op === '+' || op === '×') && i > j) continue
      if (op === '÷' && b.value.n === 0) continue
      const result = combine(a, b, op)
      const rest = tiles.filter((_, k) => k !== i && k !== j)
      const next = solve([...rest, result], failed)
      if (next) return [{ a, b, op, result }, ...next]
    }
  }
  failed.add(key)
  return null
}
export const levels = [
  [1, 2, 3, 4], [2, 3, 4, 5], [1, 3, 5, 8], [2, 2, 6, 8], [3, 3, 4, 8],
  [1, 4, 6, 8], [2, 4, 5, 7], [1, 2, 7, 9], [3, 5, 6, 9], [1, 5, 5, 5],
  [2, 3, 7, 8], [1, 3, 4, 9], [2, 5, 6, 8], [3, 4, 7, 9], [1, 6, 7, 8],
  [2, 2, 3, 9], [3, 3, 7, 8], [4, 4, 5, 8], [1, 1, 4, 6], [2, 4, 8, 9],
  [1, 3, 7, 7], [2, 5, 7, 9], [3, 4, 6, 8], [4, 5, 6, 7], [1, 4, 5, 9],
  [2, 3, 5, 9], [3, 6, 7, 8], [4, 4, 7, 9], [2, 6, 8, 9], [1, 1, 5, 5],
].filter(numbers => solve(makeTiles(numbers)) !== null)
export function seededPuzzle(seed: number): number[] {
  let s = seed >>> 0
  const random = () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 4294967296 }
  for (let tries = 0; tries < 1000; tries++) {
    const nums = Array.from({ length: 4 }, () => 1 + Math.floor(random() * 9))
    if (solve(makeTiles(nums))) return nums
  }
  return [1, 2, 3, 4]
}
export function localDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
