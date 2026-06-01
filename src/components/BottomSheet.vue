<template>
  <view v-if="render" class="sheet-root" :class="{ open: visible }">
    <view class="mask" @tap="onMask" />
    <view class="sheet" :style="{ maxHeight: maxHeight }">
      <view class="grip" />
      <view class="sheet-head" v-if="title || $slots.head">
        <slot name="head">
          <text class="sheet-title">{{ title }}</text>
        </slot>
      </view>
      <scroll-view scroll-y class="sheet-body">
        <slot />
      </scroll-view>
      <view class="sheet-foot" v-if="$slots.foot">
        <slot name="foot" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    visible: boolean;
    title?: string;
    maxHeight?: string;
    closeOnMask?: boolean;
  }>(),
  { maxHeight: "78vh", closeOnMask: true },
);

const emit = defineEmits<{
  (e: "update:visible", v: boolean): void;
  (e: "close"): void;
}>();

const render = ref(props.visible);
let timer: ReturnType<typeof setTimeout> | null = null;

watch(
  () => props.visible,
  (v) => {
    if (v) {
      if (timer) clearTimeout(timer);
      render.value = true;
    } else {
      // 等待退场动画结束再卸载
      timer = setTimeout(() => (render.value = false), 280);
    }
  },
  { immediate: true },
);

function onMask() {
  if (!props.closeOnMask) return;
  emit("update:visible", false);
  emit("close");
}
</script>

<style lang="scss" scoped>
.sheet-root {
  position: fixed;
  inset: 0;
  z-index: 200;
}
.mask {
  position: absolute;
  inset: 0;
  background: rgba(3, 5, 11, 0.6);
  backdrop-filter: blur(6rpx);
  opacity: 0;
  transition: opacity 0.28s ease;
}
.sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, #0b1020, #070a13);
  border-top-left-radius: 36rpx;
  border-top-right-radius: 36rpx;
  border-top: 1rpx solid rgba(0, 212, 255, 0.35);
  box-shadow: 0 -8rpx 60rpx rgba(0, 212, 255, 0.25);
  padding: 20rpx 28rpx;
  transform: translateY(110%);
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
  display: flex;
  flex-direction: column;
}
.open .mask {
  opacity: 1;
}
.open .sheet {
  transform: translateY(0);
}
.grip {
  width: 80rpx;
  height: 8rpx;
  border-radius: 999rpx;
  background: rgba(0, 212, 255, 0.4);
  margin: 8rpx auto 16rpx;
}
.sheet-head {
  padding: 8rpx 4rpx 20rpx;
}
.sheet-title {
  font-size: 34rpx;
  font-weight: 800;
  letter-spacing: 3rpx;
  color: #e8f0ff;
}
.sheet-body {
  flex: 1;
  min-height: 0;
}
.sheet-foot {
  padding-top: 24rpx;
  margin-top: 8rpx;
  /* 预留 Home 指示条 / 底部安全区，避免按钮被遮挡或裁切 */
  padding-bottom: calc(40rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}
</style>
