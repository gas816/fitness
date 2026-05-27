<template>
  <view class="page">
    <CyberBg />
    <view class="content">
      <view class="logo">
        <view class="logo-ring" />
        <text class="logo-txt">FIT.HUD</text>
      </view>
      <text class="slogan">PUSH YOUR LIMITS</text>
      <text class="sub">沉浸式力量训练追踪</text>

      <view class="features">
        <view class="f-item"><text class="dot" />自动加载今日训练计划</view>
        <view class="f-item"><text class="dot" />一键推进 · 游戏化体验</view>
        <view class="f-item"><text class="dot" />云端记录 · 永久保存</view>
      </view>

      <button
        class="neon-btn login-btn"
        open-type="getUserInfo"
        @getuserinfo="onUserInfo"
        @tap="onTap"
        :disabled="loading"
      >
        {{ loading ? "LOADING..." : "微信一键登录" }}
      </button>
      <text class="tip">点击即表示同意我们获取头像、昵称用于展示</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import CyberBg from "@/components/CyberBg.vue";
import { useUserStore } from "@/stores/user";
import { haptic } from "@/utils/haptic";

const user = useUserStore();
const loading = ref(false);

async function doLogin(nickname?: string, avatar?: string) {
  if (loading.value) return;
  loading.value = true;
  try {
    haptic("medium");
    await user.loginWithWeChat({ nickname, avatar });
    uni.reLaunch({ url: "/pages/index/index" });
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

function onUserInfo(e: any) {
  const info = e?.detail?.userInfo;
  doLogin(info?.nickName, info?.avatarUrl);
}

function onTap() {
  // 兼容：无授权也可登录（仅用 openid 创建用户）
  doLogin();
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  position: relative;
}
.content {
  position: relative;
  z-index: 1;
  padding: 220rpx 64rpx 64rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.logo {
  position: relative;
  width: 240rpx;
  height: 240rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2rpx dashed rgba(0, 255, 163, 0.5);
  animation: ring-rotate 12s linear infinite;
}
.logo-txt {
  font-size: 48rpx;
  font-weight: 900;
  letter-spacing: 6rpx;
  color: #00ffa3;
  text-shadow: 0 0 16rpx rgba(0, 255, 163, 0.85);
}
.slogan {
  margin-top: 60rpx;
  font-size: 56rpx;
  font-weight: 900;
  letter-spacing: 8rpx;
  color: #e8f0ff;
}
.sub {
  color: #5a6473;
  letter-spacing: 6rpx;
  margin-top: 12rpx;
  font-size: 26rpx;
}
.features {
  width: 100%;
  margin: 80rpx 0 60rpx;
}
.f-item {
  color: #b9c4d6;
  font-size: 28rpx;
  padding: 16rpx 0;
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #00ffa3;
  box-shadow: 0 0 12rpx #00ffa3;
}
.login-btn {
  width: 560rpx;
  margin-top: 20rpx;
}
.tip {
  color: #5a6473;
  font-size: 22rpx;
  margin-top: 24rpx;
}
</style>
