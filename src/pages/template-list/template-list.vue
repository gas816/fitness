<template>
  <view class="page">
    <CyberBg />
    <view class="content">
      <view class="top">
        <view class="back" @tap="goBack">‹</view>
        <text class="top-title">我的训练模板</text>
        <view class="add" @tap="createNew">+ 新建</view>
      </view>

      <view v-if="!plan.templates.length" class="empty">
        <text class="e-emoji">🗂️</text>
        <text class="e-txt">还没有训练模板</text>
        <view class="neon-btn" @tap="createNew">创建第一个计划</view>
      </view>

      <view
        v-for="t in plan.templates"
        :key="t._id"
        class="tpl cyber-card"
        :class="{ active: t.active }"
      >
        <view class="tpl-head">
          <view class="th-left">
            <text class="tpl-name">{{ t.name }}</text>
            <text class="tpl-meta">{{ summary(t) }}</text>
          </view>
          <view class="tpl-flag" v-if="t.active">启用中</view>
          <view class="tpl-flag ghost" v-else @tap="activate(t._id!)"
            >设为启用</view
          >
        </view>

        <view class="day-dots">
          <view
            v-for="key in order"
            :key="key"
            class="dot"
            :class="{ on: !t.days[key].rest && t.days[key].exercises.length }"
          >
            {{ shortLabel(key) }}
          </view>
        </view>

        <view class="tpl-actions">
          <view class="t-btn" @tap="edit(t)">编辑</view>
          <view class="t-btn danger" @tap="remove(t)">删除</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from "@dcloudio/uni-app";
import CyberBg from "@/components/CyberBg.vue";
import { usePlanStore } from "@/stores/plan";
import { useWorkoutStore } from "@/stores/workout";
import { WEEK_ORDER, WEEKDAY_LABEL } from "@/constants/workouts";
import type { PlanTemplate, WeekdayKey } from "@/types";
import { haptic } from "@/utils/haptic";

const plan = usePlanStore();
const workout = useWorkoutStore();
const order = WEEK_ORDER;

onShow(() => plan.loadTemplates(true));

function shortLabel(k: WeekdayKey) {
  return WEEKDAY_LABEL[k].slice(1);
}

function summary(t: PlanTemplate) {
  const days = order.filter(
    (k) => !t.days[k].rest && t.days[k].exercises.length,
  ).length;
  const total = order.reduce((n, k) => n + t.days[k].exercises.length, 0);
  return `${days} 个训练日 · ${total} 个动作`;
}

function createNew() {
  haptic("medium");
  plan.startDraft();
  uni.navigateTo({ url: "/pages/plan-editor/plan-editor?mode=new" });
}

function edit(t: PlanTemplate) {
  haptic("light");
  plan.startDraft(t);
  uni.navigateTo({ url: `/pages/plan-editor/plan-editor?id=${t._id}` });
}

async function activate(id: string) {
  await plan.setActive(id);
  await workout.loadToday();
  uni.showToast({ title: "已切换", icon: "success" });
}

function remove(t: PlanTemplate) {
  uni.showModal({
    title: "删除模板",
    content: `确定删除「${t.name}」？`,
    success: async (r) => {
      if (!r.confirm) return;
      await plan.remove(t._id!);
      await workout.loadToday();
    },
  });
}

function goBack() {
  const pages = getCurrentPages();
  if (pages.length > 1) uni.navigateBack();
  else uni.switchTab({ url: "/pages/profile/profile" });
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
  padding: 110rpx 32rpx 80rpx;
}
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
}
.back {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: #00d4ff;
}
.top-title {
  font-size: 34rpx;
  font-weight: 800;
  color: #e8f0ff;
  letter-spacing: 3rpx;
}
.add {
  padding: 14rpx 30rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  color: #00ffa3;
  border: 1rpx solid rgba(0, 255, 163, 0.5);
  background: rgba(0, 255, 163, 0.08);
}
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28rpx;
  padding: 140rpx 0;
}
.e-emoji {
  font-size: 96rpx;
}
.e-txt {
  color: #5a6473;
  font-size: 28rpx;
}
.tpl {
  margin-bottom: 24rpx;
  &.active {
    border-color: rgba(0, 255, 163, 0.6);
    box-shadow: 0 0 24rpx rgba(0, 255, 163, 0.3);
  }
}
.tpl-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.tpl-name {
  font-size: 38rpx;
  font-weight: 800;
  color: #e8f0ff;
}
.tpl-meta {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #5a6473;
}
.tpl-flag {
  flex-shrink: 0;
  padding: 8rpx 22rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  color: #05070d;
  font-weight: 700;
  background: linear-gradient(120deg, #00ffa3, #00d4ff);
  &.ghost {
    color: #00d4ff;
    background: transparent;
    border: 1rpx solid rgba(0, 212, 255, 0.5);
  }
}
.day-dots {
  display: flex;
  gap: 10rpx;
  margin: 26rpx 0;
}
.dot {
  flex: 1;
  text-align: center;
  padding: 12rpx 0;
  border-radius: 10rpx;
  font-size: 22rpx;
  color: #5a6473;
  background: rgba(255, 255, 255, 0.04);
  &.on {
    color: #05070d;
    font-weight: 700;
    background: linear-gradient(135deg, #00ffa3, #00d4ff);
  }
}
.tpl-actions {
  display: flex;
  gap: 18rpx;
}
.t-btn {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 14rpx;
  font-size: 28rpx;
  color: #00d4ff;
  border: 1rpx solid rgba(0, 212, 255, 0.4);
  background: rgba(0, 212, 255, 0.06);
  &.danger {
    color: #ff2bd6;
    border-color: rgba(255, 43, 214, 0.4);
    background: rgba(255, 43, 214, 0.06);
  }
}
</style>
