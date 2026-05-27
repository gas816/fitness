<template>
  <view class="ring" :style="{ width: size + 'rpx', height: size + 'rpx' }">
    <view
      class="ring-track"
      :style="{
        background: `conic-gradient(${color} ${pct}%, rgba(255,255,255,0.06) ${pct}%)`,
      }"
    />
    <view class="ring-mask">
      <slot>
        <text class="pct">{{ pct }}%</text>
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
const props = defineProps<{
  value: number; // 0~1
  size?: number;
  color?: string;
}>();
const pct = computed(() =>
  Math.max(0, Math.min(100, Math.round((props.value || 0) * 100))),
);
const color = computed(() => props.color || "#00ffa3");
const size = computed(() => props.size || 280);
</script>

<style lang="scss" scoped>
.ring {
  position: relative;
  display: inline-block;
}
.ring-track {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  filter: drop-shadow(0 0 18rpx rgba(0, 255, 163, 0.5));
  transition: background 0.5s ease;
}
.ring-mask {
  position: absolute;
  inset: 18rpx;
  border-radius: 50%;
  background: #05070d;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pct {
  font-size: 64rpx;
  font-weight: 800;
  color: #00ffa3;
  text-shadow: 0 0 12rpx rgba(0, 255, 163, 0.8);
}
</style>
