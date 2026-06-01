<template>
  <view class="day-card cyber-card" :class="{ expanded, rest: day.rest }">
    <!-- 头部 -->
    <view class="day-head" @tap="$emit('toggle')">
      <view class="dh-left">
        <text class="dh-label">{{ label }}</text>
        <text class="dh-meta">
          <template v-if="day.rest">休息日</template>
          <template v-else-if="day.exercises.length"
            >{{ day.exercises.length }} 个动作</template
          >
          <template v-else>未安排</template>
        </text>
      </view>
      <view class="dh-right">
        <view
          class="rest-toggle"
          :class="{ on: day.rest }"
          @tap.stop="$emit('toggle-rest')"
        >
          {{ day.rest ? "休息" : "训练" }}
        </view>
        <text class="chevron" :class="{ open: expanded }">›</text>
      </view>
    </view>

    <!-- 展开内容 -->
    <view v-if="expanded && !day.rest" class="day-body">
      <view class="drag-list" :style="{ height: items.length * rowPx + 'px' }">
        <view
          v-for="(ex, i) in items"
          :key="ex.id"
          class="ex-row"
          :class="{ dragging: ex.id === dragId }"
          :style="rowStyle(ex, i)"
        >
          <view
            class="handle"
            @touchstart="onDragStart($event, i)"
            @touchmove.stop.prevent="onDragMove"
            @touchend="onDragEnd"
            @touchcancel="onDragEnd"
          >
            <view class="bar" /><view class="bar" /><view class="bar" />
          </view>
          <view class="ex-info" @tap="$emit('edit', i)">
            <text class="ex-name">{{ ex.name }}</text>
            <text
              class="ex-param"
              :class="{ cardio: ex.category === 'cardio' }"
            >
              <template v-if="ex.category === 'cardio'"
                >{{ ex.duration || 0 }} 分钟 ·
                {{ ex.intensity || "中等" }}</template
              >
              <template v-else>{{ ex.sets }} 组 × {{ ex.reps }} 次</template>
            </text>
          </view>
          <view class="ex-del" @tap="$emit('remove', i)">✕</view>
        </view>
      </view>

      <view class="add-btn" @tap="$emit('add')">
        <text class="plus">+</text> 添加训练
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { PlanDay, PlanExercise } from "@/types";
import { haptic } from "@/utils/haptic";

const props = defineProps<{
  label: string;
  day: PlanDay;
  expanded: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle"): void;
  (e: "toggle-rest"): void;
  (e: "add"): void;
  (e: "edit", index: number): void;
  (e: "remove", index: number): void;
  (e: "reorder", list: PlanExercise[]): void;
}>();

const rowPx = uni.upx2px(132); // 单行高度（含间距）
const items = ref<PlanExercise[]>([]);

watch(
  () => props.day.exercises,
  (v) => {
    if (!dragId.value) items.value = [...v].sort((a, b) => a.sort - b.sort);
  },
  { immediate: true, deep: true },
);

/* ---------- 拖拽排序 ---------- */
const dragId = ref<string | null>(null);
const dragIndex = ref(-1);
const startY = ref(0);
const floatTop = ref(0);

function rowStyle(ex: PlanExercise, i: number) {
  if (ex.id === dragId.value) {
    return {
      transform: `translateY(${floatTop.value}px) scale(1.04)`,
      zIndex: 20,
      transition: "none",
    };
  }
  return { transform: `translateY(${i * rowPx}px)`, zIndex: 1 };
}

function onDragStart(e: TouchEvent, i: number) {
  dragId.value = items.value[i].id;
  dragIndex.value = i;
  startY.value = e.touches[0].pageY;
  floatTop.value = i * rowPx;
  haptic("medium");
}

function onDragMove(e: TouchEvent) {
  if (!dragId.value) return;
  const delta = e.touches[0].pageY - startY.value;
  const pointerTop = dragIndex.value * rowPx + delta;
  floatTop.value = pointerTop;
  const target = Math.max(
    0,
    Math.min(items.value.length - 1, Math.round(pointerTop / rowPx)),
  );
  if (target !== dragIndex.value) {
    const arr = items.value;
    const [moved] = arr.splice(dragIndex.value, 1);
    arr.splice(target, 0, moved);
    dragIndex.value = target;
    haptic("light");
  }
}

function onDragEnd() {
  if (!dragId.value) return;
  dragId.value = null;
  // 落位并提交新顺序
  const list = items.value.map((ex, idx) => ({ ...ex, sort: idx }));
  items.value = list;
  emit("reorder", list);
}
</script>

<style lang="scss" scoped>
.day-card {
  margin-bottom: 20rpx;
  padding: 0;
  overflow: hidden;
  transition: border-color 0.25s;
  &.expanded {
    border-color: rgba(0, 255, 163, 0.5);
    box-shadow: 0 0 24rpx rgba(0, 255, 163, 0.3);
  }
  &.rest {
    opacity: 0.72;
  }
}
.day-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 30rpx;
}
.dh-left {
  display: flex;
  align-items: baseline;
  gap: 18rpx;
}
.dh-label {
  font-size: 34rpx;
  font-weight: 800;
  color: #e8f0ff;
  letter-spacing: 2rpx;
}
.dh-meta {
  font-size: 24rpx;
  color: #5a6473;
}
.dh-right {
  display: flex;
  align-items: center;
  gap: 18rpx;
}
.rest-toggle {
  padding: 8rpx 22rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  letter-spacing: 2rpx;
  color: #00ffa3;
  border: 1rpx solid rgba(0, 255, 163, 0.5);
  background: rgba(0, 255, 163, 0.08);
  &.on {
    color: #5a6473;
    border-color: rgba(90, 100, 115, 0.5);
    background: rgba(255, 255, 255, 0.04);
  }
}
.chevron {
  font-size: 40rpx;
  color: #00d4ff;
  transition: transform 0.25s;
  &.open {
    transform: rotate(90deg);
  }
}
.day-body {
  padding: 4rpx 24rpx 28rpx;
}
.drag-list {
  position: relative;
  width: 100%;
}
.ex-row {
  position: absolute;
  left: 0;
  right: 0;
  height: 116rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 0 18rpx;
  border-radius: 16rpx;
  background: rgba(0, 212, 255, 0.06);
  border: 1rpx solid rgba(0, 212, 255, 0.18);
  transition: transform 0.26s cubic-bezier(0.22, 1, 0.36, 1);
  &.dragging {
    background: rgba(0, 255, 163, 0.14);
    border-color: rgba(0, 255, 163, 0.7);
    box-shadow: 0 12rpx 40rpx rgba(0, 255, 163, 0.4);
  }
}
.handle {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  padding: 16rpx 10rpx;
}
.bar {
  width: 32rpx;
  height: 4rpx;
  border-radius: 4rpx;
  background: rgba(0, 212, 255, 0.6);
}
.ex-info {
  flex: 1;
  min-width: 0;
}
.ex-name {
  display: block;
  font-size: 30rpx;
  color: #e8f0ff;
  font-weight: 600;
}
.ex-param {
  display: block;
  font-size: 24rpx;
  color: #00ffa3;
  margin-top: 6rpx;
  &.cardio {
    color: #34e7e4;
  }
}
.ex-del {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff2bd6;
  font-size: 30rpx;
}
.add-btn {
  margin-top: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  border: 1rpx dashed rgba(0, 255, 163, 0.5);
  color: #00ffa3;
  font-size: 28rpx;
  letter-spacing: 2rpx;
  background: rgba(0, 255, 163, 0.04);
}
.plus {
  font-size: 36rpx;
  font-weight: 700;
}
</style>
