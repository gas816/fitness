<template>
  <view class="cyber-bg">
    <view class="grid" />
    <view class="scan" />
    <view class="orb orb-a" />
    <view class="orb orb-b" />
  </view>
</template>

<style lang="scss" scoped>
.cyber-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(
      ellipse at 20% 0%,
      rgba(0, 212, 255, 0.18),
      transparent 55%
    ),
    radial-gradient(
      ellipse at 80% 100%,
      rgba(0, 255, 163, 0.16),
      transparent 55%
    ),
    linear-gradient(180deg, #05070d 0%, #04060b 100%);
  overflow: hidden;
}
.grid {
  position: absolute;
  inset: -10%;
  background-image:
    linear-gradient(rgba(0, 212, 255, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 255, 0.07) 1px, transparent 1px);
  background-size: 80rpx 80rpx;
  mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);
  -webkit-mask-image: radial-gradient(
    ellipse at center,
    #000 30%,
    transparent 75%
  );
  transform: perspective(900rpx) rotateX(55deg) translateY(80rpx);
}
.scan {
  position: absolute;
  left: 0;
  right: 0;
  height: 240rpx;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(0, 255, 163, 0.12),
    transparent
  );
  animation: scan-line 7.5s linear infinite;
}
.orb {
  position: absolute;
  width: 520rpx;
  height: 520rpx;
  border-radius: 50%;
  filter: blur(60rpx);
  opacity: 0.6;
}
.orb-a {
  top: -120rpx;
  right: -120rpx;
  background: #00d4ff;
}
.orb-b {
  bottom: -160rpx;
  left: -160rpx;
  background: #00ffa3;
}
</style>
