<template>
  <scroll-view scroll-x class="ts-scroll" :show-scrollbar="false">
    <view class="ts-row">
      <view
        v-for="t in templates"
        :key="t._id"
        class="ts-chip"
        :class="{ active: t._id === activeId }"
        @tap="$emit('switch', t._id!)"
      >
        <text class="ts-name">{{ t.name }}</text>
        <text class="ts-tag" v-if="t._id === activeId">启用中</text>
      </view>
      <view class="ts-chip new" @tap="$emit('create')">
        <text class="ts-plus">+</text> 新建
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import type { PlanTemplate } from "@/types";

defineProps<{
  templates: PlanTemplate[];
  activeId?: string;
}>();

defineEmits<{
  (e: "switch", id: string): void;
  (e: "create"): void;
}>();
</script>

<style lang="scss" scoped>
.ts-scroll {
  white-space: nowrap;
  width: 100%;
}
.ts-row {
  display: inline-flex;
  gap: 16rpx;
  padding: 4rpx 0;
}
.ts-chip {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 16rpx 28rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.04);
  border: 1rpx solid rgba(0, 212, 255, 0.18);
  transition: all 0.2s;
  &.active {
    border-color: rgba(0, 255, 163, 0.7);
    background: rgba(0, 255, 163, 0.1);
    box-shadow: 0 0 18rpx rgba(0, 255, 163, 0.4);
  }
  &.new {
    flex-direction: row;
    align-items: center;
    gap: 8rpx;
    color: #00d4ff;
    border-style: dashed;
    border-color: rgba(0, 212, 255, 0.5);
  }
}
.ts-name {
  font-size: 28rpx;
  color: #e8f0ff;
  font-weight: 600;
}
.ts-tag {
  font-size: 20rpx;
  color: #00ffa3;
  margin-top: 4rpx;
  letter-spacing: 2rpx;
}
.ts-plus {
  font-size: 32rpx;
  font-weight: 700;
}
</style>
