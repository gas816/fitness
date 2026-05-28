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

      <view class="features" v-if="!showProfile">
        <view class="f-item"><text class="dot" />自动加载今日训练计划</view>
        <view class="f-item"><text class="dot" />一键推进 · 游戏化体验</view>
        <view class="f-item"><text class="dot" />云端记录 · 永久保存</view>
      </view>

      <!-- 资料完善卡片 -->
      <view v-if="showProfile" class="profile-card cyber-card">
        <text class="pc-title">完善你的战士档案</text>
        <button
          class="avatar-btn"
          open-type="chooseAvatar"
          @chooseavatar="onChooseAvatar"
        >
          <image
            v-if="avatar"
            :src="avatar"
            class="avatar-img"
            mode="aspectFill"
          />
          <view v-else class="avatar-ph">
            <text class="ph-plus">+</text>
            <text class="ph-tip">点击选择头像</text>
          </view>
        </button>
        <view class="nick-row">
          <text class="nick-lbl">昵称</text>
          <input
            class="nick-ipt"
            type="nickname"
            v-model="nickname"
            placeholder="请输入昵称"
            placeholder-style="color:#3a4252"
          />
        </view>
        <view class="pc-actions">
          <view class="ghost-btn skip" @tap="doLogin()">跳过</view>
          <view
            class="neon-btn confirm"
            :class="{ disabled: !canConfirm || loading }"
            @tap="onConfirm"
            >{{ loading ? "LOADING..." : "确认登录" }}</view
          >
        </view>
      </view>

      <button
        v-else
        class="neon-btn login-btn"
        @tap="showProfile = true"
        :disabled="loading"
      >
        微信一键登录
      </button>
      <text v-if="!showProfile" class="tip"
        >点击后选择头像、填写昵称用于展示</text
      >
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import CyberBg from "@/components/CyberBg.vue";
import { useUserStore } from "@/stores/user";
import { haptic } from "@/utils/haptic";

const user = useUserStore();
const loading = ref(false);
const showProfile = ref(false);
const avatar = ref("");
const nickname = ref("");

const canConfirm = computed(() => !!nickname.value.trim());

function onChooseAvatar(e: any) {
  const url = e?.detail?.avatarUrl;
  if (url) {
    avatar.value = url;
    haptic("light");
  }
}

function onConfirm() {
  if (!canConfirm.value || loading.value) return;
  doLogin(nickname.value.trim(), avatar.value || undefined);
}

async function doLogin(nick?: string, avatarUrl?: string) {
  if (loading.value) return;
  loading.value = true;
  try {
    haptic("medium");
    await user.loginWithWeChat({ nickname: nick, avatar: avatarUrl });
    uni.reLaunch({ url: "/pages/index/index" });
  } catch (e) {
    console.error(e);
    uni.showToast({ title: "登录失败", icon: "none" });
  } finally {
    loading.value = false;
  }
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
.profile-card {
  width: 100%;
  margin-top: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 32rpx;
}
.pc-title {
  color: #00d4ff;
  letter-spacing: 6rpx;
  font-size: 28rpx;
  margin-bottom: 28rpx;
}
.avatar-btn {
  width: 180rpx;
  height: 180rpx;
  padding: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  border: 2rpx dashed rgba(0, 255, 163, 0.55);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  &::after {
    border: none;
  }
}
.avatar-img {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
}
.avatar-ph {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #5a6473;
}
.ph-plus {
  font-size: 56rpx;
  color: #00ffa3;
  line-height: 1;
}
.ph-tip {
  margin-top: 8rpx;
  font-size: 22rpx;
  letter-spacing: 2rpx;
}
.nick-row {
  width: 100%;
  margin-top: 32rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 12rpx 0;
  border-bottom: 1rpx solid rgba(0, 212, 255, 0.25);
}
.nick-lbl {
  color: #5a6473;
  letter-spacing: 4rpx;
  font-size: 26rpx;
}
.nick-ipt {
  flex: 1;
  font-size: 30rpx;
  color: #e8f0ff;
  padding: 8rpx 0;
}
.pc-actions {
  margin-top: 40rpx;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
}
.ghost-btn.skip {
  flex: 0 0 auto;
  padding: 22rpx 40rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(0, 212, 255, 0.45);
  color: #00d4ff;
  letter-spacing: 4rpx;
  font-size: 26rpx;
}
.confirm {
  flex: 1;
  padding: 22rpx 0;
  font-size: 30rpx;
}
.confirm.disabled {
  opacity: 0.5;
}
</style>
