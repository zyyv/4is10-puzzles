<script setup lang="ts">
import { ArrowUpRight, Check, LockKeyhole, Star } from '@lucide/vue'
import { levels } from '../game/solver'
defineProps<{ level: number; progress: Record<string, number>; completed: number; isJourney: boolean }>()
defineEmits<{ select: [index: number]; daily: [] }>()
</script>
<template>
  <aside class="journey-panel">
    <div class="panel-heading"><span class="small-label">一点点，变厉害</span><span class="mini-spark">✳</span></div>
    <h2>你的灵感旅程<span>从这里开始。</span></h2>
    <div class="chapter"><span>01 / 数字漫游</span><span>{{ completed }} / {{ levels.length }}</span></div>
    <div class="journey-grid" aria-label="选择关卡">
      <button v-for="(_, i) in levels" :key="i" :class="{ current: isJourney && level === i, passed: progress[`level-${i}`] }" :aria-label="`第 ${i + 1} 关${progress[`level-${i}`] ? '，已通关' : ''}`" :aria-current="isJourney && level === i ? 'step' : undefined" @click="$emit('select', i)">
        <Check v-if="progress[`level-${i}`]" :size="18"/><span v-else>{{ String(i + 1).padStart(2, '0') }}</span>
        <span v-if="progress[`level-${i}`]" class="level-stars">{{ '·'.repeat(progress[`level-${i}`]!) }}</span>
      </button>
    </div>
    <div class="chapter-footer"><Star :size="13"/><span>不急，每一关都值得想一想</span></div>
    <button class="daily-card" @click="$emit('daily')"><span class="daily-icon">10<span>今日</span></span><span><strong>每日一题</strong><small>每天一个新的小挑战</small></span><ArrowUpRight :size="20"/></button>
    <div class="local-note"><LockKeyhole :size="12"/> 进度自动保存在此浏览器</div>
  </aside>
</template>
