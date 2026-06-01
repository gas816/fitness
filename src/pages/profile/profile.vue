<template>
  <view class="page">
    <CyberBg />
    <view class="content">
      <view class="head">
        <view class="avatar-wrap">
          <image
            v-if="user.avatar"
            :src="user.avatar"
            class="avatar"
            mode="aspectFill"
          />
          <view v-else class="avatar placeholder">{{
            user.nickname.slice(0, 1)
          }}</view>
          <view class="ring-deco" />
        </view>
        <text class="name">{{ user.nickname }}</text>
        <text class="oid">UID · {{ uidTail }}</text>
      </view>

      <view class="stats cyber-card">
        <view class="s">
          <text class="num">{{ stats.weekCount }}</text>
          <text class="lbl">本周训练</text>
        </view>
        <view class="div" />
        <view class="s">
          <text class="num">{{ stats.totalDays }}</text>
          <text class="lbl">累计天数</text>
        </view>
        <view class="div" />
        <view class="s">
          <text class="num">{{ stats.cardioMinutes }}</text>
          <text class="lbl">有氧 MIN</text>
        </view>
      </view>

      <view class="menu">
        <view class="item" @tap="goTemplates">
          <text class="m-l">我的训练计划</text><text class="m-r">›</text>
        </view>
        <view class="item" @tap="goCalendar">
          <text class="m-l">训练日历</text><text class="m-r">›</text>
        </view>
        <view class="item" @tap="resetToday">
          <text class="m-l">重置今日训练</text><text class="m-r">›</text>
        </view>
        <view class="item danger" @tap="logout">
          <text class="m-l">退出登录</text><text class="m-r">›</text>
        </view>
      </view>

      <text class="ver">v1.0.0 · MADE FOR THE STRONG</text>
    </view>
    <CustomTabBar :current="3" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from "vue";
import CyberBg from "@/components/CyberBg.vue";
import { useUserStore } from "@/stores/user";
import { useWorkoutStore } from "@/stores/workout";
import { fetchStats } from "@/api/workout";
import CustomTabBar from "@/components/CustomTabBar.vue";

const user = useUserStore();
const workout = useWorkoutStore();

const stats = reactive({ weekCount: 0, totalDays: 0, cardioMinutes: 0 });
const uidTail = computed(() =>
  (user.user?.openid || "").slice(-8).toUpperCase(),
);

onMounted(async () => {
  try {
    const s = await fetchStats();
    Object.assign(stats, s);
  } catch {}
});

function goCalendar() {
  uni.switchTab({ url: "/pages/calendar/calendar" });
}

function goTemplates() {
  uni.navigateTo({ url: "/pages/template-list/template-list" });
}

function resetToday() {
  uni.showModal({
    title: "确认重置",
    content: "将清空今日训练进度，确定继续？",
    success: (r) => {
      if (r.confirm) workout.reset();
    },
  });
}

function logout() {
  uni.showModal({
    title: "退出登录",
    content: "将清除本地登录态",
    success: (r) => {
      if (r.confirm) user.logout();
    },
  });
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
  padding: 140rpx 32rpx 200rpx;
}
.head {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.avatar-wrap {
  position: relative;
  width: 200rpx;
  height: 200rpx;
}
.avatar {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(0, 255, 163, 0.6);
  box-shadow: 0 0 24rpx rgba(0, 255, 163, 0.5);
}
.avatar.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #05070d;
  font-weight: 900;
  font-size: 80rpx;
  background: linear-gradient(135deg, #00ffa3, #00d4ff);
}
.ring-deco {
  position: absolute;
  inset: -16rpx;
  border-radius: 50%;
  border: 1rpx dashed rgba(0, 212, 255, 0.5);
  animation: ring-rotate 12s linear infinite;
}
.name {
  margin-top: 28rpx;
  font-size: 40rpx;
  font-weight: 800;
  color: #e8f0ff;
  letter-spacing: 2rpx;
}
.oid {
  margin-top: 6rpx;
  color: #5a6473;
  font-size: 22rpx;
  letter-spacing: 4rpx;
}

.stats {
  margin-top: 40rpx;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.stats .s {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stats .num {
  font-size: 52rpx;
  font-weight: 900;
  color: #00ffa3;
  text-shadow: 0 0 12rpx rgba(0, 255, 163, 0.7);
}
.stats .lbl {
  font-size: 22rpx;
  color: #5a6473;
  margin-top: 4rpx;
  letter-spacing: 3rpx;
}
.stats .div {
  width: 2rpx;
  height: 60rpx;
  background: rgba(0, 212, 255, 0.25);
}

.menu {
  margin-top: 60rpx;
}
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 24rpx;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  background: rgba(255, 255, 255, 0.04);
  border: 1rpx solid rgba(0, 212, 255, 0.12);
  &.danger .m-l {
    color: #ff2bd6;
  }
}
.m-l {
  color: #e8f0ff;
  font-size: 30rpx;
}
.m-r {
  color: #5a6473;
  font-size: 32rpx;
}
.ver {
  display: block;
  text-align: center;
  color: #3a4252;
  margin-top: 60rpx;
  letter-spacing: 4rpx;
  font-size: 22rpx;
}
</style>
