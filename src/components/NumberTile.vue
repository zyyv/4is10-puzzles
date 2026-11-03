<script setup lang="ts">
import { motion } from 'motion-v'
import { usePreferredReducedMotion } from '@vueuse/core'
import { display, type Tile } from '../game/solver'
defineProps<{ tile: Tile; selected: boolean; index: number; disabled: boolean }>()
defineEmits<{ choose: [id: string] }>()
const reduced = usePreferredReducedMotion()
</script>
<template>
  <motion.button layout class="number-tile" :class="{ selected, combined: tile.expression.startsWith('(') }" :disabled="disabled" :aria-pressed="selected" :aria-label="`数字 ${display(tile.value)}${selected ? '，已选中' : ''}`" :initial="reduced === 'reduce' ? false : { opacity: 0, y: 24, rotate: index % 2 ? 3 : -3 }" :animate="{ opacity: 1, y: 0, rotate: selected ? -3 : 0, scale: selected ? 1.045 : 1 }" :while-hover="disabled || reduced === 'reduce' ? {} : { y: -7 }" :while-press="reduced === 'reduce' ? {} : { scale: .96 }" :transition="{ type: 'spring', stiffness: 350, damping: 25 }" @click="$emit('choose', tile.id)">
    <span class="tile-index">{{ tile.expression.startsWith('(') ? '合并数字' : `0${index + 1}` }}</span>
    <span class="tile-value" :class="{ fraction: tile.value.d !== 1 }">{{ display(tile.value) }}</span>
    <span class="tile-bottom">{{ selected ? '已选中 ↗' : tile.expression.startsWith('(') ? tile.expression : '点击选择' }}</span>
  </motion.button>
</template>
