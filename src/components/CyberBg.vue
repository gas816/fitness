<template>
  <!-- 静态背景（光斑/网格/底色）已下沉到全局 page 样式（见 App.vue），
       这里只保留一条自上而下的扫描光波，避免切 tab 时整套背景重挂导致顿挫 -->
  <view class="cyber-scan" />
</template>

<style lang="scss" scoped>
.cyber-scan {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 240rpx;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(0, 255, 163, 0.12),
    transparent
  );
  animation: cyber-scan-line 7.5s linear infinite;
}
@keyframes cyber-scan-line {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(2000rpx);
  }
}
</style>
