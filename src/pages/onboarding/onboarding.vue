<template>
  <view class="page">
    <CyberBg />
    <view class="content">
      <view class="intro">
        <text class="step">STEP 01</text>
        <text class="title">选择你的训练方式</text>
        <text class="desc">3 分钟搭建属于你的训练系统</text>
      </view>

      <view class="cards">
        <view
          class="opt-card recommend"
          :class="{ busy: loading === 'rec' }"
          @tap="useRecommended"
        >
          <view class="badge">推荐</view>
          <text class="oc-title">使用推荐训练计划</text>
          <text class="oc-sub">适合大多数健身新人</text>
          <view class="oc-tags">
            <text class="tag">力量A</text>
            <text class="tag">力量B</text>
            <text class="tag">力量C</text>
            <text class="tag">有氧</text>
          </view>
          <view class="oc-cta">{{
            loading === "rec" ? "导入中..." : "一键开始 →"
          }}</view>
        </view>

        <view
          class="opt-card custom"
          :class="{ busy: loading === 'new' }"
          @tap="createCustom"
        >
          <text class="oc-title">创建我的训练计划</text>
          <text class="oc-sub">自由定制你的训练安排</text>
          <view class="oc-illust">
            <view class="bar b1" /><view class="bar b2" /><view
              class="bar b3"
            />
            <view class="bar b4" /><view class="bar b5" />
          </view>
          <view class="oc-cta ghost">{{
            loading === "new" ? "创建中..." : "进入向导 →"
          }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import CyberBg from "@/components/CyberBg.vue";
import { usePlanStore } from "@/stores/plan";
import { haptic, playMission } from "@/utils/haptic";

const plan = usePlanStore();
const loading = ref<"" | "rec" | "new">("");

async function useRecommended() {
  if (loading.value) return;
  loading.value = "rec";
  try {
    haptic("medium");
    await plan.importRecommended();
    playMission();
    uni.reLaunch({ url: "/pages/index/index" });
  } catch (e) {
    uni.showToast({ title: "导入失败", icon: "none" });
  } finally {
    loading.value = "";
  }
}

async function createCustom() {
  if (loading.value) return;
  loading.value = "new";
  try {
    haptic("medium");
    plan.startDraft();
    uni.navigateTo({ url: "/pages/plan-editor/plan-editor?mode=new" });
  } finally {
    loading.value = "";
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
  padding: 180rpx 48rpx 60rpx;
}
.intro {
  margin-bottom: 64rpx;
}
.step {
  display: block;
  font-size: 24rpx;
  letter-spacing: 8rpx;
  color: #00d4ff;
}
.title {
  display: block;
  margin-top: 18rpx;
  font-size: 56rpx;
  font-weight: 900;
  color: #e8f0ff;
  letter-spacing: 2rpx;
}
.desc {
  display: block;
  margin-top: 16rpx;
  font-size: 28rpx;
  color: #5a6473;
}
.cards {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}
.opt-card {
  position: relative;
  padding: 44rpx 40rpx;
  border-radius: 28rpx;
  overflow: hidden;
  transition: transform 0.15s ease;
  &:active {
    transform: scale(0.97);
  }
  &.busy {
    opacity: 0.7;
  }
}
.recommend {
  background: linear-gradient(
    140deg,
    rgba(0, 255, 163, 0.18),
    rgba(0, 212, 255, 0.1)
  );
  border: 1rpx solid rgba(0, 255, 163, 0.6);
  box-shadow: 0 0 40rpx rgba(0, 255, 163, 0.35);
}
.custom {
  background: linear-gradient(
    140deg,
    rgba(124, 92, 255, 0.16),
    rgba(0, 212, 255, 0.08)
  );
  border: 1rpx solid rgba(124, 92, 255, 0.5);
}
.badge {
  position: absolute;
  top: 28rpx;
  right: 28rpx;
  padding: 6rpx 20rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  color: #05070d;
  font-weight: 700;
  background: linear-gradient(120deg, #00ffa3, #00d4ff);
}
.oc-title {
  display: block;
  font-size: 42rpx;
  font-weight: 800;
  color: #e8f0ff;
}
.oc-sub {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #b9c4d6;
}
.oc-tags {
  display: flex;
  gap: 14rpx;
  margin-top: 28rpx;
}
.tag {
  padding: 8rpx 22rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #00ffa3;
  border: 1rpx solid rgba(0, 255, 163, 0.4);
  background: rgba(0, 255, 163, 0.06);
}
.oc-illust {
  display: flex;
  align-items: flex-end;
  gap: 14rpx;
  height: 90rpx;
  margin-top: 28rpx;
}
.oc-illust .bar {
  width: 28rpx;
  border-radius: 6rpx;
  background: linear-gradient(180deg, #7c5cff, #00d4ff);
  box-shadow: 0 0 12rpx rgba(124, 92, 255, 0.6);
}
.b1 {
  height: 40rpx;
}
.b2 {
  height: 70rpx;
}
.b3 {
  height: 54rpx;
}
.b4 {
  height: 88rpx;
}
.b5 {
  height: 48rpx;
}
.oc-cta {
  margin-top: 32rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: #00ffa3;
  letter-spacing: 2rpx;
  &.ghost {
    color: #b3a5ff;
  }
}
</style>
