<template>
  <BottomSheet
    :visible="visible"
    title="设置时长 / 强度"
    max-height="70vh"
    @update:visible="(v) => emit('update:visible', v)"
  >
    <view class="picker-preview">
      <text class="pp-min">{{ durationOptions[durIndex] }}</text>
      <text class="pp-unit">分钟</text>
      <text class="pp-dot">·</text>
      <text class="pp-int">{{ intensityOptions[intIndex] }}</text>
    </view>

    <view class="copy-row" v-if="canCopyPrev">
      <view class="copy-btn" @tap="copyPrev">
        <text class="ci">⟲</text>
        沿用上一项 · {{ prevText }}
      </view>
    </view>

    <view class="pv-wrap">
      <picker-view
        class="pv"
        indicator-class="pv-indicator"
        :value="[durIndex, intIndex]"
        @change="onChange"
      >
        <picker-view-column>
          <view v-for="(d, i) in durationOptions" :key="i" class="pv-item"
            >{{ d }} 分钟</view
          >
        </picker-view-column>
        <picker-view-column>
          <view v-for="(s, i) in intensityOptions" :key="i" class="pv-item">{{
            s
          }}</view>
        </picker-view-column>
      </picker-view>
      <view class="pv-mask pv-mask-top" />
      <view class="pv-mask pv-mask-bottom" />
    </view>

    <template #foot>
      <view class="neon-btn confirm" @tap="confirm">确定</view>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import BottomSheet from "./BottomSheet.vue";
import { haptic } from "@/utils/haptic";

const props = defineProps<{
  visible: boolean;
  duration?: number;
  intensity?: string;
  /** 上一项的参数，用于「沿用上一项」 */
  prevDuration?: number;
  prevIntensity?: string;
}>();

const emit = defineEmits<{
  (e: "update:visible", v: boolean): void;
  (e: "confirm", payload: { duration: number; intensity: string }): void;
}>();

// 5..90 分钟，步长 5
const durationOptions = Array.from({ length: 18 }, (_, i) => (i + 1) * 5);
const intensityOptions = ["轻松", "中等", "较高", "高强度"];

const durIndex = ref(3); // 默认 20 分钟
const intIndex = ref(1); // 默认 中等

watch(
  () => props.visible,
  (v) => {
    if (!v) return;
    const d = props.duration ?? 20;
    const di = durationOptions.indexOf(d);
    durIndex.value = di === -1 ? 3 : di;
    const it = props.intensity ?? "中等";
    const ii = intensityOptions.indexOf(it);
    intIndex.value = ii === -1 ? 1 : ii;
  },
);

const canCopyPrev = computed(
  () => !!props.prevDuration && !!props.prevIntensity,
);
const prevText = computed(
  () => `${props.prevDuration}分钟·${props.prevIntensity}`,
);

function onChange(e: any) {
  const [di, ii] = e.detail.value as number[];
  if (di !== durIndex.value || ii !== intIndex.value) haptic("light");
  durIndex.value = di;
  intIndex.value = ii;
}

function copyPrev() {
  if (!canCopyPrev.value) return;
  haptic("medium");
  const di = durationOptions.indexOf(props.prevDuration!);
  const ii = intensityOptions.indexOf(props.prevIntensity!);
  if (di >= 0) durIndex.value = di;
  if (ii >= 0) intIndex.value = ii;
}

function confirm() {
  haptic("medium");
  emit("confirm", {
    duration: durationOptions[durIndex.value],
    intensity: intensityOptions[intIndex.value],
  });
  emit("update:visible", false);
}
</script>

<style lang="scss" scoped>
.picker-preview {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 14rpx;
  padding: 16rpx 0 8rpx;
}
.pp-min,
.pp-int {
  font-size: 72rpx;
  font-weight: 900;
  color: #34e7e4;
  text-shadow: 0 0 18rpx rgba(52, 231, 228, 0.7);
}
.pp-unit {
  font-size: 28rpx;
  color: #5a6473;
}
.pp-dot {
  font-size: 48rpx;
  color: #00d4ff;
}
.copy-row {
  display: flex;
  justify-content: center;
  margin: 12rpx 0 20rpx;
}
.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  padding: 14rpx 30rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #00d4ff;
  border: 1rpx solid rgba(0, 212, 255, 0.5);
  background: rgba(0, 212, 255, 0.08);
}
.ci {
  font-weight: 700;
  letter-spacing: 1rpx;
}
.pv-wrap {
  position: relative;
}
.pv {
  height: 380rpx;
  width: 100%;
}
.pv-item {
  line-height: 80rpx;
  text-align: center;
  font-size: 34rpx;
  color: #b9c4d6;
}
:deep(.pv-indicator) {
  height: 80rpx;
  border-top: 1rpx solid rgba(52, 231, 228, 0.4);
  border-bottom: 1rpx solid rgba(52, 231, 228, 0.4);
}
/* 用深色渐变遮罩盖住微信默认的白色蒙层，使其与暗色主题协调 */
.pv-mask {
  position: absolute;
  left: 0;
  right: 0;
  height: 150rpx;
  pointer-events: none;
  z-index: 2;
}
.pv-mask-top {
  top: 0;
  background: linear-gradient(180deg, #0a0e1a 8%, rgba(10, 14, 26, 0));
}
.pv-mask-bottom {
  bottom: 0;
  background: linear-gradient(0deg, #0a0e1a 8%, rgba(10, 14, 26, 0));
}
.confirm {
  width: 100%;
}
</style>
