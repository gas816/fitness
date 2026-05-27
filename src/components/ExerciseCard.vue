<template>
  <view class="exercise-card cyber-card" :class="{ 'is-out': exiting }">
    <view class="head">
      <view class="idx-pill"
        >{{ String(index + 1).padStart(2, "0") }} /
        {{ String(total).padStart(2, "0") }}</view
      >
      <text class="badge" v-if="exercise.isTimed">TIMED</text>
    </view>

    <text class="name">{{ exercise.name }}</text>
    <text class="rep">{{ exercise.repRange }} · 推荐</text>

    <view class="sets">
      <view
        v-for="(s, i) in exercise.sets"
        :key="i"
        class="set-dot"
        :class="{ done: s.done, active: !s.done && i === currentSetIdx }"
      >
        {{ i + 1 }}
      </view>
    </view>

    <view class="row">
      <view class="big-num" :key="popKey">
        <text class="cur">{{ remaining }}</text>
        <text class="lbl">剩余组</text>
      </view>
      <view class="big-num">
        <text class="cur">{{ done }}</text>
        <text class="lbl">已完成</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Exercise } from "@/types";

const props = defineProps<{
  exercise: Exercise;
  index: number;
  total: number;
  popKey: number;
  exiting: boolean;
}>();

const currentSetIdx = computed(() =>
  props.exercise.sets.findIndex((s) => !s.done),
);
const done = computed(() => props.exercise.sets.filter((s) => s.done).length);
const remaining = computed(() => props.exercise.sets.length - done.value);
</script>

<style lang="scss" scoped>
.exercise-card {
  margin: 24rpx 0 32rpx;
  animation: pulse-glow 3.6s ease-in-out infinite;
  transition:
    transform 0.5s cubic-bezier(0.5, -0.2, 0.4, 1),
    opacity 0.5s ease;
  &.is-out {
    animation: card-out 0.5s forwards;
  }
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.idx-pill {
  font-size: 22rpx;
  letter-spacing: 4rpx;
  padding: 6rpx 18rpx;
  border-radius: 999rpx;
  color: #00d4ff;
  border: 1rpx solid rgba(0, 212, 255, 0.5);
  background: rgba(0, 212, 255, 0.08);
}
.badge {
  font-size: 20rpx;
  letter-spacing: 4rpx;
  color: #ff2bd6;
  border: 1rpx solid rgba(255, 43, 214, 0.5);
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
}
.name {
  display: block;
  margin-top: 24rpx;
  font-size: 48rpx;
  font-weight: 800;
  color: #e8f0ff;
  letter-spacing: 2rpx;
}
.rep {
  display: block;
  margin-top: 8rpx;
  color: #00ffa3;
  font-size: 26rpx;
  letter-spacing: 4rpx;
  text-shadow: 0 0 8rpx rgba(0, 255, 163, 0.55);
}
.sets {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 28rpx;
}
.set-dot {
  width: 72rpx;
  height: 72rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  color: #5a6473;
  font-weight: 700;
  border: 1rpx solid rgba(255, 255, 255, 0.07);
  transition: all 0.25s ease;
  &.done {
    color: #05070d;
    background: linear-gradient(135deg, #00ffa3, #00d4ff);
    box-shadow: 0 0 16rpx rgba(0, 255, 163, 0.7);
    border-color: transparent;
  }
  &.active {
    color: #00ffa3;
    border-color: rgba(0, 255, 163, 0.7);
    box-shadow: 0 0 16rpx rgba(0, 255, 163, 0.45);
  }
}
.row {
  display: flex;
  justify-content: space-around;
  margin-top: 28rpx;
}
.big-num {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: number-pop 0.45s ease;
}
.big-num .cur {
  font-size: 80rpx;
  font-weight: 900;
  color: #00ffa3;
  text-shadow: 0 0 16rpx rgba(0, 255, 163, 0.75);
}
.big-num .lbl {
  font-size: 22rpx;
  letter-spacing: 4rpx;
  color: #5a6473;
  margin-top: 4rpx;
}
</style>
