<script setup lang="ts">
import { nextTick, useTemplateRef } from 'vue'
import { useMediaQuery, usePreferredReducedMotion } from '@vueuse/core'
import { Volume2, VolumeX, ArrowUpRight, Sparkles } from '@lucide/vue'
import GameBoard from './components/GameBoard.vue'
import JourneyPanel from './components/JourneyPanel.vue'
import { useGame, type Mode } from './composables/useGame'
const game = useGame()
const main = useTemplateRef<HTMLElement>('main')
const isPhone = useMediaQuery('(max-width: 600px), (max-width: 950px) and (max-height: 500px)')
const reduced = usePreferredReducedMotion()
async function returnToGame() {
  if (!isPhone.value) return
  await nextTick()
  main.value?.scrollIntoView({ behavior: reduced.value === 'reduce' ? 'instant' : 'smooth', block: 'start' })
}
function selectLevel(index: number) {
  game.load('journey', index)
  void returnToGame()
}
function selectDaily() {
  game.load('daily')
  void returnToGame()
}
const { mode, level, sound, completed, progress } = game
const modes: { id: Mode; label: string; sub: string }[] = [{ id: 'journey', label: '闯关旅程', sub: '01' }, { id: 'daily', label: '每日一题', sub: '02' }, { id: 'practice', label: '自由练习', sub: '03' }]
</script>
<template>
  <div class="app-shell">
    <header class="site-header"><a href="./" class="brand" aria-label="凑个十首页"><span class="brand-symbol">4<span>=</span>10</span><span class="brand-name">凑个十<span>A LITTLE NUMBER PLAY</span></span></a><div class="header-right"><span class="header-note">给大脑，放个小假。</span><button class="sound-button" :aria-label="sound ? '关闭音效' : '开启音效'" :aria-pressed="sound" @click="game.toggleSound"><Volume2 v-if="sound" :size="18"/><VolumeX v-else :size="18"/></button><a href="https://github.com/zyyv/4is10-puzzles" target="_blank" rel="noopener noreferrer" class="github-link">GitHub<ArrowUpRight :size="15"/></a></div></header>
    <nav class="mode-nav" aria-label="游戏模式"><button v-for="item in modes" :key="item.id" :class="{ active: mode === item.id }" :aria-current="mode === item.id ? 'page' : undefined" @click="game.load(item.id)"><span>{{ item.sub }}</span>{{ item.label }}<span v-if="item.id === 'daily'" class="daily-dot"></span></button><span class="nav-aside"><Sparkles :size="13"/> 不拼手速，只拼灵感</span></nav>
    <main ref="main" class="main-layout"><GameBoard :game="game"/><JourneyPanel :level="level" :progress="progress" :completed="completed" :is-journey="mode === 'journey'" @select="selectLevel" @daily="selectDaily"/></main>
    <footer class="site-footer"><span>FOUR NUMBERS. ENDLESS POSSIBILITIES.</span><span>把复杂留给生活，把十留给自己。<span class="footer-flower">✳</span></span></footer>
  </div>
</template>
