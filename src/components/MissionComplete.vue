<template>
  <view class="mission-mask" v-if="show" @tap="$emit('close')">
    <view class="hud">
      <view class="ring-deco" />
      <text class="t1">MISSION COMPLETE</text>
      <text class="t2">今日训练完成</text>
      <text class="t3">你正在变强 · {{ pct }}%</text>
      <view class="meta">
        <view class="m-item">
          <text class="m-num">{{ sets }}</text>
          <text class="m-lbl">SETS</text>
        </view>
        <view class="m-divider" />
        <view class="m-item">
          <text class="m-num">{{ minutes }}</text>
          <text class="m-lbl">MIN</text>
        </view>
      </view>
      <view class="neon-btn" @tap.stop="$emit('close')">CLOSE</view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
  pct: number;
  sets: number;
  minutes: number;
}>();
defineEmits<{ (e: "close"): void }>();
</script>

<style lang="scss" scoped>
.mission-mask {
  position: fixed;
  inset: 0;
  z-index: 99;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 212, 255, 0.25),
    rgba(0, 0, 0, 0.92)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.4s ease;
}
.hud {
  position: relative;
  width: 620rpx;
  padding: 80rpx 40rpx 60rpx;
  border-radius: 32rpx;
  text-align: center;
  background: rgba(5, 7, 13, 0.7);
  border: 1rpx solid rgba(0, 255, 163, 0.4);
  box-shadow:
    0 0 60rpx rgba(0, 255, 163, 0.4),
    inset 0 0 30rpx rgba(0, 212, 255, 0.2);
  backdrop-filter: blur(20rpx);
}
.ring-deco {
  position: absolute;
  top: -120rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 240rpx;
  height: 240rpx;
  border-radius: 50%;
  border: 2rpx dashed rgba(0, 255, 163, 0.6);
  animation: ring-rotate 12s linear infinite;
  &::before {
    content: "";
    position: absolute;
    inset: 18rpx;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(0, 255, 163, 0.5),
      transparent 70%
    );
  }
}
.t1 {
  display: block;
  font-size: 44rpx;
  font-weight: 900;
  letter-spacing: 8rpx;
  color: #00ffa3;
  text-shadow:
    0 0 14rpx #00ffa3,
    0 0 36rpx rgba(0, 255, 163, 0.6);
  margin-top: 60rpx;
}
.t2 {
  display: block;
  font-size: 30rpx;
  color: #e8f0ff;
  margin-top: 16rpx;
  letter-spacing: 6rpx;
}
.t3 {
  display: block;
  font-size: 26rpx;
  color: #00d4ff;
  margin-top: 12rpx;
}
.meta {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 48rpx 0;
}
.m-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 180rpx;
}
.m-num {
  font-size: 64rpx;
  font-weight: 800;
  color: #00ffa3;
  text-shadow: 0 0 12rpx rgba(0, 255, 163, 0.7);
}
.m-lbl {
  font-size: 22rpx;
  color: #5a6473;
  letter-spacing: 6rpx;
  margin-top: 8rpx;
}
.m-divider {
  width: 2rpx;
  height: 80rpx;
  background: rgba(0, 212, 255, 0.3);
}
.neon-btn {
  width: 320rpx;
  margin: 0 auto;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
