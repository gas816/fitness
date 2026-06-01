<template>
  <BottomSheet
    :visible="visible"
    max-height="82vh"
    @update:visible="(v) => emit('update:visible', v)"
  >
    <template #head>
      <view class="picker-head">
        <text class="ph-title">选择动作</text>
        <text class="ph-sub">点击即可加入 {{ dayLabel }}</text>
      </view>
    </template>

    <!-- 智能推荐 -->
    <view v-if="suggestions.length" class="suggest">
      <text class="sg-title">⚡ 智能推荐 · 搭配 {{ lastAddedName }}</text>
      <scroll-view scroll-x class="sg-scroll" :show-scrollbar="false">
        <view class="sg-row">
          <view
            v-for="ex in suggestions"
            :key="ex.id"
            class="sg-chip"
            @tap="pick(ex)"
          >
            + {{ ex.name }}
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 分类 tab -->
    <scroll-view scroll-x class="cat-scroll" :show-scrollbar="false">
      <view class="cat-row">
        <view
          v-for="c in categories"
          :key="c.key"
          class="cat"
          :class="{ active: c.key === activeCat }"
          :style="c.key === activeCat ? { '--c': c.color } : {}"
          @tap="switchCat(c.key)"
        >
          <text class="cat-ico">{{ c.icon }}</text>
          <text class="cat-lbl">{{ c.label }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 动作网格 -->
    <view class="grid">
      <view
        v-for="(ex, i) in filtered"
        :key="ex.id"
        class="ex"
        :style="{ animationDelay: i * 24 + 'ms' }"
        @tap="pick(ex)"
      >
        <text class="ex-name">{{ ex.name }}</text>
        <view class="ex-add">+</view>
      </view>
    </view>
  </BottomSheet>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import BottomSheet from "./BottomSheet.vue";
import {
  CATEGORIES,
  EXERCISE_LIBRARY,
  getSuggestions,
} from "@/constants/exerciseLibrary";
import type { ExerciseCategory, LibExercise } from "@/types";
import { haptic } from "@/utils/haptic";

const props = defineProps<{
  visible: boolean;
  dayLabel?: string;
  /** 最近添加的动作 id，用于智能推荐 */
  lastAddedId?: string;
}>();

const emit = defineEmits<{
  (e: "update:visible", v: boolean): void;
  (e: "pick", ex: LibExercise): void;
}>();

const categories = CATEGORIES;
const activeCat = ref<ExerciseCategory>("chest");

const filtered = computed(() =>
  EXERCISE_LIBRARY.filter((e) => e.category === activeCat.value),
);

const suggestions = computed(() =>
  props.lastAddedId ? getSuggestions(props.lastAddedId) : [],
);
const lastAddedName = computed(
  () => EXERCISE_LIBRARY.find((e) => e.id === props.lastAddedId)?.name || "",
);

function switchCat(k: ExerciseCategory) {
  if (k === activeCat.value) return;
  haptic("light");
  activeCat.value = k;
}

function pick(ex: LibExercise) {
  haptic("medium");
  emit("pick", ex);
}
</script>

<style lang="scss" scoped>
.picker-head {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
}
.ph-title {
  font-size: 36rpx;
  font-weight: 800;
  color: #e8f0ff;
  letter-spacing: 3rpx;
}
.ph-sub {
  font-size: 22rpx;
  color: #5a6473;
}
.suggest {
  margin-bottom: 20rpx;
  padding: 18rpx;
  border-radius: 18rpx;
  background: linear-gradient(
    120deg,
    rgba(255, 43, 214, 0.12),
    rgba(0, 212, 255, 0.08)
  );
  border: 1rpx solid rgba(255, 43, 214, 0.3);
}
.sg-title {
  display: block;
  font-size: 24rpx;
  color: #ff8ae6;
  margin-bottom: 14rpx;
  letter-spacing: 2rpx;
}
.sg-scroll {
  white-space: nowrap;
}
.sg-row {
  display: inline-flex;
  gap: 14rpx;
}
.sg-chip {
  flex-shrink: 0;
  padding: 14rpx 26rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  color: #00ffa3;
  background: rgba(0, 255, 163, 0.1);
  border: 1rpx solid rgba(0, 255, 163, 0.45);
}
.cat-scroll {
  white-space: nowrap;
  margin-bottom: 20rpx;
}
.cat-row {
  display: inline-flex;
  gap: 16rpx;
  padding: 4rpx 0;
}
.cat {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 110rpx;
  padding: 16rpx 8rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.04);
  border: 1rpx solid rgba(255, 255, 255, 0.07);
  transition: all 0.2s;
  &.active {
    border-color: var(--c, #00ffa3);
    background: rgba(0, 255, 163, 0.1);
    box-shadow: 0 0 18rpx rgba(0, 255, 163, 0.4);
  }
}
.cat-ico {
  font-size: 40rpx;
}
.cat-lbl {
  font-size: 24rpx;
  color: #b9c4d6;
  margin-top: 6rpx;
  letter-spacing: 2rpx;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  padding-bottom: 20rpx;
}
.ex {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 26rpx;
  border-radius: 18rpx;
  background: rgba(0, 212, 255, 0.06);
  border: 1rpx solid rgba(0, 212, 255, 0.18);
  animation: ex-in 0.32s both;
  &:active {
    transform: scale(0.96);
    border-color: rgba(0, 255, 163, 0.6);
  }
}
.ex-name {
  font-size: 30rpx;
  color: #e8f0ff;
  font-weight: 600;
}
.ex-add {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  font-weight: 700;
  color: #05070d;
  background: linear-gradient(135deg, #00ffa3, #00d4ff);
  box-shadow: 0 0 14rpx rgba(0, 255, 163, 0.6);
}
@keyframes ex-in {
  from {
    opacity: 0;
    transform: translateY(20rpx) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
