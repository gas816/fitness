<template>
  <BottomSheet
    :visible="visible"
    title="设置组数 / 次数"
    max-height="70vh"
    @update:visible="(v) => emit('update:visible', v)"
  >
    <view class="picker-preview">
      <text class="pp-sets">{{ sets }}</text>
      <text class="pp-x">组 ×</text>
      <text class="pp-reps">{{ repsOptions[repIndex] }}</text>
      <text class="pp-unit">次</text>
    </view>

    <view class="copy-row" v-if="canCopyPrev">
      <view class="copy-btn" @tap="copyPrev">
        <text class="ci">⟲</text>
        沿用上一组参数 · {{ prevText }}
      </view>
    </view>

    <view class="pv-wrap">
      <picker-view
        class="pv"
        indicator-class="pv-indicator"
        :value="[setIndex, repIndex]"
        @change="onChange"
      >
        <picker-view-column>
          <view v-for="n in setRange" :key="n" class="pv-item"
            >{{ n }} 组</view
          >
        </picker-view-column>
        <picker-view-column>
          <view v-for="(r, i) in repsOptions" :key="i" class="pv-item">{{
            r
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
  sets?: number;
  reps?: string;
  /** 上一项的参数，用于「沿用上一组」 */
  prevSets?: number;
  prevReps?: string;
}>();

const emit = defineEmits<{
  (e: "update:visible", v: boolean): void;
  (e: "confirm", payload: { sets: number; reps: string }): void;
}>();

const setRange = Array.from({ length: 8 }, (_, i) => i + 1); // 1..8
const repsOptions = [
  "6",
  "8",
  "10",
  "12",
  "15",
  "20",
  "8-12",
  "10-15",
  "12-15",
  "30s",
  "45s",
  "60s",
  "力竭",
];

const setIndex = ref(2); // 默认 3 组
const repIndex = ref(2); // 默认 10 次

const sets = computed(() => setRange[setIndex.value]);

watch(
  () => props.visible,
  (v) => {
    if (!v) return;
    const s = props.sets ?? 3;
    setIndex.value = Math.max(
      0,
      setRange.indexOf(s) === -1 ? 2 : setRange.indexOf(s),
    );
    const r = props.reps ?? "10";
    const ri = repsOptions.indexOf(r);
    repIndex.value = ri === -1 ? 2 : ri;
  },
);

const canCopyPrev = computed(() => !!props.prevSets && !!props.prevReps);
const prevText = computed(() => `${props.prevSets}×${props.prevReps}`);

function onChange(e: any) {
  const [si, ri] = e.detail.value as number[];
  if (si !== setIndex.value || ri !== repIndex.value) haptic("light");
  setIndex.value = si;
  repIndex.value = ri;
}

function copyPrev() {
  if (!canCopyPrev.value) return;
  haptic("medium");
  const si = setRange.indexOf(props.prevSets!);
  const ri = repsOptions.indexOf(props.prevReps!);
  if (si >= 0) setIndex.value = si;
  if (ri >= 0) repIndex.value = ri;
}

function confirm() {
  haptic("medium");
  emit("confirm", { sets: sets.value, reps: repsOptions[repIndex.value] });
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
.pp-sets,
.pp-reps {
  font-size: 84rpx;
  font-weight: 900;
  color: #00ffa3;
  text-shadow: 0 0 18rpx rgba(0, 255, 163, 0.8);
}
.pp-x {
  font-size: 32rpx;
  color: #00d4ff;
}
.pp-unit {
  font-size: 28rpx;
  color: #5a6473;
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
  border-top: 1rpx solid rgba(0, 255, 163, 0.4);
  border-bottom: 1rpx solid rgba(0, 255, 163, 0.4);
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
