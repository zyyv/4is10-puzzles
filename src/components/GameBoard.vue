<script setup lang="ts">
import { ref, computed } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { useEventListener, usePreferredReducedMotion } from '@vueuse/core'
import { ArrowRight, Undo2, RotateCcw, Lightbulb, X, Check, Star, Shuffle } from '@lucide/vue'
import NumberTile from './NumberTile.vue'
import { display, operations, type Op } from '../game/solver'
import type { useGame } from '../composables/useGame'
const { game } = defineProps<{ game: ReturnType<typeof useGame> }>()
const { mode, level, numbers, tiles, history, selected, operator, clock, activeTile, instruction, hintText, message, won, lost, stars, today } = game
const reduced = usePreferredReducedMotion()
const help = ref<HTMLDialogElement | null>(null)
function openHelp() { help.value?.showModal() }
function closeHelp() { help.value?.close() }
const title = computed(() => mode.value === 'daily' ? '今天，也向 10 靠近一点。' : mode.value === 'practice' ? '随心玩，不设限。' : level.value < 5 ? '小数字，大可能。' : '换个思路，刚刚好。')
useEventListener(window, 'keydown', (event: KeyboardEvent) => {
  if (help.value?.open || event.ctrlKey || event.metaKey || event.altKey || (event.target as HTMLElement)?.closest('input, textarea, select')) return
  if (['1', '2', '3', '4'].includes(event.key)) { event.preventDefault(); const tile = tiles.value[Number(event.key) - 1]; if (tile) game.choose(tile.id) }
  const op = ({ '+': '+', '-': '−', '*': '×', '/': '÷' } as Record<string, Op>)[event.key]
  if (op) { event.preventDefault(); game.operate(op) }
  if (event.key === 'Backspace' || event.key.toLowerCase() === 'z') { event.preventDefault(); game.undo() }
  if (event.key === 'Escape') { selected.value = null; operator.value = null }
})
</script>
<template>
  <section class="play-area" aria-label="游戏区域">
    <div class="game-heading"><div><div class="eyebrow"><span class="status-dot"></span>{{ mode === 'daily' ? `每日挑战 / ${today}` : mode === 'practice' ? '自由练习 / 无限灵感' : `数字漫游 / LEVEL ${String(level + 1).padStart(2, '0')}` }}</div><h1>{{ title }}</h1><p>四个数字，各用一次。加减乘除，刚好凑成 <strong>10</strong>。</p></div><button class="how-button" @click="openHelp">怎么玩 <span>?</span></button></div>
    <div class="game-table" :class="{ 'is-won': won }">
      <div class="table-top"><span>{{ mode === 'daily' ? 'DAILY PUZZLE' : mode === 'practice' ? 'PLAYGROUND' : `PUZZLE ${String(level + 1).padStart(3, '0')}` }}</span><span class="timer">{{ clock }}</span></div>
      <div class="target"><span>本局目标</span><div><small>=</small>10<span class="target-spark">✳</span></div></div>
      <div class="tile-row" :class="{ single: tiles.length === 1 }"><NumberTile v-for="(tile, index) in tiles" :key="tile.id" :tile="tile" :index="index" :selected="selected === tile.id" :disabled="won || lost" @choose="game.choose"/></div>
      <div class="expression-preview" aria-live="polite"><template v-if="won"><Check :size="18"/> {{ tiles[0]?.expression }} = 10</template><template v-else-if="activeTile"><strong>{{ display(activeTile.value) }}</strong><span>{{ operator || '?' }}</span><span class="preview-blank">?</span></template><template v-else><span class="preview-guide">{{ instruction }}</span></template></div>
      <div v-if="!won" class="operator-row" aria-label="运算符"><button v-for="op in operations" :key="op" :disabled="!selected || lost" :class="{ active: operator === op }" :aria-pressed="operator === op" :aria-label="({ '+': '加', '−': '减', '×': '乘', '÷': '除' })[op]" @click="game.operate(op)">{{ op }}</button></div>
      <AnimatePresence><motion.div v-if="won" class="win-message" :initial="reduced === 'reduce' ? false : { opacity: 0, y: 12 }" :animate="{ opacity: 1, y: 0 }"><div class="win-stars"><Star v-for="n in 3" :key="n" :size="23" :fill="n <= stars ? 'currentColor' : 'none'"/></div><strong>灵光一闪，刚好是十！</strong><p>{{ stars === 3 ? '无提示通关，三颗星属于你。' : '又找到了一种可能，继续保持。' }}</p><button class="next-button" @click="game.next">{{ mode === 'journey' ? '继续下一关' : '再来一题' }}<ArrowRight :size="17"/></button></motion.div></AnimatePresence>
      <div v-if="!won" class="board-message" aria-live="polite" :class="{ alert: lost || message }">{{ message || hintText || (lost ? instruction : '先选数字，再选运算符，最后选另一个数字。') }}</div>
      <div class="table-actions"><button :disabled="!history.length || won" @click="game.undo"><Undo2 :size="16"/>撤销<span class="key-hint">Z</span></button><button :disabled="won" @click="game.reset"><RotateCcw :size="15"/>重来</button><button v-if="mode === 'practice'" @click="game.load('practice')"><Shuffle :size="15"/>换题</button><button class="hint-button" :disabled="won" @click="game.hint"><Lightbulb :size="16"/>一点提示</button></div>
    </div>
    <div class="scratchpad"><div class="scratch-title"><span>思路留个脚印</span><span>{{ history.length }} / 3 步</span></div><div class="scratch-lines"><template v-if="history.length"><span v-for="(step, i) in history" :key="i"><small>0{{ i + 1 }}</small>{{ step.line }}<Check :size="13"/></span></template><p v-else>每一次合并，都会记在这里。</p></div></div>
    <div class="board-bottom"><span>原始数字 <b>{{ numbers.join(' · ') }}</b></span><span>按 1–4 选数字 · Z 撤销</span></div>
  </section>
  <Teleport to="body"><dialog ref="help" class="modal-backdrop" @click.self="closeHelp"><section class="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title"><button class="modal-close" aria-label="关闭玩法" autofocus @click="closeHelp"><X :size="22"/></button><span class="small-label">HOW TO PLAY</span><h2 id="help-title">四个数字，<br>一个刚好的 10。</h2><ol><li>选一个数字，再选 +、−、× 或 ÷。</li><li>选另一个数字，两个数字就会合并。</li><li>用完四个数字，最后剩下 10 就赢了。</li></ol><div class="help-example">1 + 2 = 3 <ArrowRight :size="16"/> 3 + 3 = 6 <ArrowRight :size="16"/> 6 + 4 = 10</div><p>减法和除法按点击顺序计算。允许分数、负数和重复数字；每块积木只能用一次。合并顺序自然形成括号。</p><p>不用提示获得 ★★★，提示一次 ★★，更多提示 ★。随时撤销，不扣星。</p><button class="next-button" @click="closeHelp">明白了，开玩<ArrowRight :size="18"/></button></section></dialog></Teleport>
</template>
