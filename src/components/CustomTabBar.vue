<template>
  <view class="tabbar-wrap">
    <view class="tabbar">
      <view
        v-for="(item, i) in tabs"
        :key="item.path"
        class="tab"
        :class="{ active: current === i }"
        @tap="onTap(i)"
      >
        <text class="ico">{{ item.icon }}</text>
        <text class="lbl">{{ item.text }}</text>
        <view class="dot" v-if="current === i" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{ current: number }>();

const tabs = [
  { path: "/pages/index/index", text: "力量", icon: "💪" },
  { path: "/pages/cardio/cardio", text: "有氧", icon: "🔥" },
  { path: "/pages/calendar/calendar", text: "日历", icon: "📅" },
  { path: "/pages/profile/profile", text: "我的", icon: "👤" },
];

function onTap(i: number) {
  uni.switchTab({ url: tabs[i].path });
}
</script>

<style lang="scss" scoped>
.tabbar-wrap {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  padding-bottom: env(safe-area-inset-bottom);
  pointer-events: none;
}
.tabbar {
  pointer-events: auto;
  margin: 0 24rpx 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 14rpx 12rpx;
  border-radius: 28rpx;
  background: linear-gradient(
    180deg,
    rgba(11, 16, 32, 0.55),
    rgba(5, 7, 13, 0.78)
  );
  backdrop-filter: blur(18rpx);
  -webkit-backdrop-filter: blur(18rpx);
  border: 1rpx solid rgba(0, 212, 255, 0.25);
  box-shadow:
    0 0 24rpx rgba(0, 212, 255, 0.18),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.04);
}
.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8rpx 0 6rpx;
  position: relative;
  transition: transform 0.15s ease;
  &:active {
    transform: scale(0.94);
  }
}
.ico {
  font-size: 36rpx;
  line-height: 1;
  filter: grayscale(0.4) brightness(0.85);
  transition: filter 0.2s ease;
}
.lbl {
  margin-top: 6rpx;
  font-size: 22rpx;
  letter-spacing: 3rpx;
  color: #8892a6;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.7);
}
.tab.active {
  .ico {
    filter: none;
    text-shadow: 0 0 10rpx rgba(0, 255, 163, 0.7);
  }
  .lbl {
    color: #00ffa3;
    font-weight: 700;
    text-shadow:
      0 0 8rpx rgba(0, 255, 163, 0.7),
      0 1rpx 2rpx rgba(0, 0, 0, 0.6);
  }
}
.dot {
  position: absolute;
  bottom: 0;
  width: 36rpx;
  height: 4rpx;
  border-radius: 2rpx;
  background: linear-gradient(90deg, #00ffa3, #00d4ff);
  box-shadow: 0 0 10rpx rgba(0, 255, 163, 0.8);
}
</style>
