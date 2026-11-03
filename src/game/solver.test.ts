import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calculate, combine, fraction, levels, makeTiles, seededPuzzle, solve } from './solver.ts'
test('精确分数、负数和除零', () => {
  assert.deepEqual(calculate(fraction(1, 3), fraction(2, 3), '+'), fraction(1))
  assert.deepEqual(calculate(fraction(2), fraction(5), '−'), fraction(-3))
  assert.throws(() => calculate(fraction(1), fraction(0), '÷'))
})
test('所有关卡都能用四块积木通过三次合并得到 10', () => {
  assert.equal(levels.length, 30)
  for (const numbers of levels) {
    const moves = solve(makeTiles(numbers))
    assert.ok(moves, `${numbers} 无解`)
    let tiles = makeTiles(numbers)
    assert.equal(moves.length, 3)
    for (const move of moves) {
      assert.ok(tiles.find(t => t.id === move.a.id))
      assert.ok(tiles.find(t => t.id === move.b.id))
      assert.notEqual(move.a.id, move.b.id)
      tiles = [...tiles.filter(t => t.id !== move.a.id && t.id !== move.b.id), combine(move.a, move.b, move.op)]
    }
    assert.equal(tiles.length, 1)
    assert.deepEqual(tiles[0]!.value, fraction(10))
  }
})
test('每日题确定性和生成题可解性', () => {
  assert.deepEqual(seededPuzzle(20261103), seededPuzzle(20261103))
  for (let seed = 1; seed <= 100; seed++) assert.ok(solve(makeTiles(seededPuzzle(seed))))
})
test('零值、重复数字、无解局面', () => {
  assert.ok(solve(makeTiles([0, 0, 1, 9])))
  assert.ok(solve(makeTiles([5, 5, 5, 5])))
  assert.equal(solve(makeTiles([1, 1, 1, 1])), null)
  assert.equal(solve(makeTiles([0, 0, 0, 0])), null)
})
