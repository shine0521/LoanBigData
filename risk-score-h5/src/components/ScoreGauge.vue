<!--
  ScoreGauge.vue - 综合评分仪表盘组件（ECharts）
  props:
    score: 评分数字（0-1000）
    level: 风险等级
-->
<template>
  <div class="score-gauge">
    <div ref="chartRef" class="gauge-chart" />
    <!-- 分数显示（覆盖在图表上方） -->
    <div class="gauge-center">
      <div class="score-number">{{ displayScore }}</div>
      <div class="score-label">综合评分</div>
      <div class="level-tag" :class="levelClass">{{ level }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { GaugeChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption } from 'echarts/core'
import { getRiskColor } from '@/utils/format'

// 注册 ECharts 组件
echarts.use([GaugeChart, TitleComponent, TooltipComponent, CanvasRenderer])

interface Props {
  score: number
  level: '低风险' | '中风险' | '高风险'
}

const props = defineProps<Props>()

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null
const displayScore = ref(0)

/** 风险等级对应颜色 */
function getLevelColor(level: string): string {
  return getRiskColor(level as '低风险' | '中风险' | '高风险')
}

/** 分数滚动动画（easeOutCubic） */
function animateScore(target: number, duration = 1500) {
  const start = performance.now()
  function tick(now: number) {
    const progress = Math.min((now - start) / duration, 1)
    // easeOutCubic: 1 - (1 - t)^3
    const eased = 1 - Math.pow(1 - progress, 3)
    displayScore.value = Math.round(target * eased)
    if (progress < 1) {
      requestAnimationFrame(tick)
    } else {
      displayScore.value = target
    }
  }
  requestAnimationFrame(tick)
}

/** 初始化 / 更新图表 */
function updateChart() {
  if (!chartInstance) return
  const color = getLevelColor(props.level)
  const option: EChartsCoreOption = {
    series: [
      {
        type: 'gauge',
        startAngle: 210,        // 起始角度（圆心偏左）
        endAngle: -30,         // 结束角度
        min: 0,
        max: 1000,
        splitNumber: 5,
        radius: '90%',
        center: ['50%', '55%'],
        axisLine: {
          lineStyle: {
            width: 12,
            // 渐变色：绿色→橙色→红色
            color: [
              [0.6, '#00C853'],      // 0-600: 绿色（低风险）
              [0.8, '#FF9900'],      // 600-800: 橙色（中风险）
              [1, '#FF3D00'],        // 800-1000: 红色（高风险）
            ],
          },
        },
        // 指针
        pointer: {
          show: true,
          length: '60%',
          width: 6,
          itemStyle: {
            color: color,
          },
        },
        // 刻度标签
        axisTick: {
          show: true,
          distance: 14,
          length: 5,
          lineStyle: {
            color: '#E5E5E5',
            width: 1,
          },
        },
        splitLine: {
          show: true,
          distance: 16,
          length: 10,
          lineStyle: {
            color: '#E5E5E5',
            width: 1.5,
          },
        },
        axisLabel: {
          show: true,
          distance: 22,
          color: '#999999',
          fontSize: 10,
          formatter: (val: number) => String(val),
        },
        detail: {
          show: false, // 数字我们自己用 div 覆盖层显示
        },
        data: [{ value: props.score }],
        animation: true,
        animationDuration: 1500,
        animationEasing: 'cubicOut',
      },
    ],
  }
  chartInstance.setOption(option, true)
}

/** 等级 CSS 类名 */
function getLevelClass(level: string): string {
  const map: Record<string, string> = {
    '低风险': 'level-low',
    '中风险': 'level-medium',
    '高风险': 'level-high',
  }
  return map[level] || ''
}

const levelClass = ref('level-medium')

onMounted(async () => {
  await nextTick()
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    updateChart()
    animateScore(props.score)
    levelClass.value = getLevelClass(props.level)
  }
})

onBeforeUnmount(() => {
  chartInstance?.dispose()
  chartInstance = null
})

watch(
  () => [props.score, props.level],
  async () => {
    levelClass.value = getLevelClass(props.level)
    updateChart()
    animateScore(props.score)
  }
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.score-gauge {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gauge-chart {
  width: 100%;
  height: 5.333rem; // 200px
}

.gauge-center {
  position: absolute;
  top: 55%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
}

.score-number {
  font-size: 1.067rem; // 40px
  font-weight: 700;
  color: $color-text-primary;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.score-label {
  font-size: $font-size-xs;
  color: $color-text-secondary;
}

.level-tag {
  display: inline-block;
  padding: 0.08rem 0.32rem;
  border-radius: $radius-full;
  font-size: $font-size-xs;
  font-weight: 500;
  color: #fff;
  &.level-low    { background-color: $color-risk-low; }
  &.level-medium { background-color: $color-risk-medium; }
  &.level-high   { background-color: $color-risk-high; }
}
</style>
