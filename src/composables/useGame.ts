import { computed, ref, shallowRef, watch } from 'vue'
import { useStorage, useIntervalFn, useDocumentVisibility } from '@vueuse/core'
import { play, setEnabled, setVolume, unlock } from 'cuelume'
import { combine, display, levels, localDate, makeTiles, seededPuzzle, solve, type Op, type Tile } from '../game/solver'
export type Mode = 'journey' | 'daily' | 'practice'
export function useGame() {
  const progress = useStorage<Record<string, number>>('ten-progress-v1', {})
  const sound = useStorage('ten-sound-v1', true)
  const mode = shallowRef<Mode>('journey')
  const level = shallowRef(0)
  const numbers = ref<number[]>(levels[0]!)
  const tiles = ref<Tile[]>(makeTiles(numbers.value))
  const history = ref<{ tiles: Tile[]; line: string }[]>([])
  const selected = shallowRef<string | null>(null)
  const operator = shallowRef<Op | null>(null)
  const elapsed = shallowRef(0)
  const hints = shallowRef(0)
  const hintText = shallowRef('')
  const message = shallowRef('')
  const started = shallowRef(false)
  const practiceId = shallowRef(0)
  const today = shallowRef(localDate())
  const visibility = useDocumentVisibility()
  const won = computed(() => tiles.value.length === 1 && tiles.value[0]!.value.n === 10 * tiles.value[0]!.value.d)
  const lost = computed(() => tiles.value.length === 1 && !won.value)
  const key = computed(() => mode.value === 'daily' ? `daily-${today.value}` : mode.value === 'journey' ? `level-${level.value}` : `practice-${practiceId.value}`)
  const stars = computed(() => hints.value === 0 ? 3 : hints.value === 1 ? 2 : 1)
  const completed = computed(() => levels.filter((_, i) => progress.value[`level-${i}`]).length)
  const clock = computed(() => `${String(Math.floor(elapsed.value / 60)).padStart(2, '0')}:${String(elapsed.value % 60).padStart(2, '0')}`)
  const activeTile = computed(() => tiles.value.find(t => t.id === selected.value))
  const instruction = computed(() => won.value ? '漂亮！每个数字都找到了自己的位置。' : lost.value ? '差一点点，撤销一步再试试。' : operator.value ? '选第二个数字，完成这次合并' : selected.value ? '接下来，选一个运算符' : '先选一个数字，让灵感开始')
  watch(sound, value => { setEnabled(value); setVolume(.35) }, { immediate: true })
  useIntervalFn(() => { if (started.value && !won.value && !lost.value && visibility.value === 'visible') elapsed.value++ }, 1000)
  watch(won, value => {
    if (!value) return
    if (mode.value !== 'practice') progress.value = { ...progress.value, [key.value]: Math.max(progress.value[key.value] || 0, stars.value) }
    play('success')
  })
  function reset() {
    tiles.value = makeTiles(numbers.value); history.value = []; selected.value = null; operator.value = null
    elapsed.value = 0; hints.value = 0; hintText.value = ''; message.value = ''; started.value = false
  }
  function load(nextMode: Mode, index = level.value) {
    mode.value = nextMode; level.value = index; today.value = localDate()
    if (nextMode === 'journey') numbers.value = levels[index]!
    else if (nextMode === 'daily') numbers.value = seededPuzzle(Number(today.value.replaceAll('-', '')))
    else { practiceId.value++; numbers.value = seededPuzzle(Date.now() + practiceId.value) }
    reset(); play('navigate')
  }
  function choose(id: string) {
    if (won.value || lost.value) return
    void unlock(); started.value = true; message.value = ''; hintText.value = ''
    if (selected.value === id) { selected.value = null; operator.value = null; return }
    if (!selected.value || !operator.value) { selected.value = id; play('select'); return }
    const a = activeTile.value!, b = tiles.value.find(t => t.id === id)!
    if (operator.value === '÷' && b.value.n === 0) { message.value = '0 不能做除数，换个数字试试。'; play('error'); return }
    const result = combine(a, b, operator.value)
    const line = `${display(a.value)} ${operator.value} ${display(b.value)} = ${display(result.value)}`
    history.value.push({ tiles: [...tiles.value], line })
    const at = Math.min(tiles.value.indexOf(a), tiles.value.indexOf(b))
    const next = tiles.value.filter(t => t.id !== a.id && t.id !== b.id)
    next.splice(at, 0, result); tiles.value = next; selected.value = null; operator.value = null; play('tap')
  }
  function operate(op: Op) {
    if (!selected.value || won.value || lost.value) return
    operator.value = operator.value === op ? null : op; play('select')
  }
  function undo() {
    const previous = history.value.pop()
    if (!previous) return
    tiles.value = previous.tiles; selected.value = null; operator.value = null; hintText.value = ''; message.value = ''; play('navigate')
  }
  function hint() {
    if (won.value) return
    const answer = solve(tiles.value)
    hints.value++; started.value = true; play('open')
    const move = answer?.[0]
    hintText.value = move ? `试着先算 ${display(move.a.value)} ${move.op} ${display(move.b.value)} = ${display(move.result.value)}` : '这条路暂时走不通，撤销一步再看看。'
  }
  function next() { if (mode.value === 'journey') load('journey', (level.value + 1) % levels.length); else load('practice') }
  async function toggleSound() { sound.value = !sound.value; setEnabled(sound.value); if (sound.value) { await unlock(); play('toggle') } }
  return { progress, sound, mode, level, numbers, tiles, history, selected, operator, elapsed, hints, hintText, message, won, lost, stars, completed, clock, activeTile, instruction, today, choose, operate, undo, hint, reset, load, next, toggleSound }
}
