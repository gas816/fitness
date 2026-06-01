<template>
  <view class="page">
    <CyberBg />

    <view class="content">
      <view class="header">
        <view>
          <text class="hello">HEY, {{ user.nickname }}</text>
          <text class="today">{{ todayLabel }}</text>
        </view>
        <RingProgress :value="store.progress" :size="160">
          <view class="ring-inner">
            <text class="ring-pct">{{ store.progressPct }}</text>
            <text class="ring-lbl">%</text>
          </view>
        </RingProgress>
      </view>

      <view class="title-block" v-if="store.template">
        <text class="neon-title">{{
          store.title || store.template.title
        }}</text>
        <text class="sub">{{ store.template.subtitle }}</text>
      </view>

      <!-- 训练模式 -->
      <block v-if="store.template && store.template.type !== 'CARDIO'">
        <view class="card-wrap">
          <ExerciseCard
            v-if="store.currentExercise"
            :exercise="store.currentExercise"
            :index="store.currentIndex"
            :total="store.exercises.length"
            :pop-key="flow.popKey.value"
            :exiting="flow.cardOut.value"
          />
        </view>

        <view class="action-row">
          <view class="ghost-btn" @tap="onUndo">撤销</view>
          <view class="neon-btn done-btn" @tap="onComplete">完成一组</view>
        </view>

        <view class="next-list">
          <text class="next-title">UP NEXT</text>
          <view
            v-for="(ex, i) in nextList"
            :key="ex.id"
            class="next-item"
            :class="{ pending: i === 0 }"
          >
            <text class="n-idx">{{
              String(store.currentIndex + 2 + i).padStart(2, "0")
            }}</text>
            <text class="n-name">{{ ex.name }}</text>
            <text class="n-rep">{{ ex.repRange }}</text>
          </view>
        </view>
      </block>

      <!-- 有氧日 -->
      <block v-else-if="store.template && store.template.type === 'CARDIO'">
        <view class="cardio-hint cyber-card">
          <text class="ch-title">今日为有氧日</text>
          <text class="ch-sub">前往「有氧」页选择项目并开始</text>
          <view class="neon-btn" @tap="goCardio">START CARDIO</view>
        </view>
      </block>

      <!-- 休息日 -->
      <block v-else>
        <view class="rest cyber-card">
          <text class="r-title">REST DAY</text>
          <text class="r-sub">今天好好休息，让肌肉超量恢复</text>
        </view>
      </block>
    </view>

    <MissionComplete
      :show="flow.missionOverlay.value"
      :pct="store.progressPct"
      :sets="store.completedSets"
      :minutes="durationMinutes"
      @close="flow.hideMission()"
    />
    <CustomTabBar :current="0" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import CyberBg from "@/components/CyberBg.vue";
import ExerciseCard from "@/components/ExerciseCard.vue";
import RingProgress from "@/components/RingProgress.vue";
import MissionComplete from "@/components/MissionComplete.vue";
import CustomTabBar from "@/components/CustomTabBar.vue";
import { useUserStore } from "@/stores/user";
import { useWorkoutStore } from "@/stores/workout";
import { usePlanStore } from "@/stores/plan";
import { useWorkoutFlow } from "@/composables/useWorkoutFlow";
import { haptic, playDone, playMission } from "@/utils/haptic";

const user = useUserStore();
const store = useWorkoutStore();
const plan = usePlanStore();
const flow = useWorkoutFlow();

const WEEK = ["日", "一", "二", "三", "四", "五", "六"];
const todayLabel = computed(() => {
  const d = new Date();
  return `${d.getMonth() + 1}月${d.getDate()}日 · 周${WEEK[d.getDay()]}`;
});

const nextList = computed(() =>
  store.exercises.slice(store.currentIndex + 1, store.currentIndex + 4),
);
const durationMinutes = computed(() =>
  Math.max(
    1,
    Math.round((Date.now() - (store.startedAt || Date.now())) / 60000),
  ),
);

onMounted(() => store.loadToday());
onShow(() => {
  if (!user.isLogin) {
    uni.reLaunch({ url: "/pages/login/login" });
    return;
  }
  // 无训练模板 → 引导创建
  if (plan.loaded && !plan.hasTemplate) {
    uni.reLaunch({ url: "/pages/onboarding/onboarding" });
    return;
  }
  store.loadToday();
});

async function onComplete() {
  if (!store.currentExercise) return;
  const { exerciseDone, missionDone } = store.completeOneSet();
  haptic("light");
  flow.triggerSetPop();

  if (missionDone) {
    playMission();
    await flow.playExerciseOut();
    store.advanceExercise();
    flow.showMission();
    return;
  }
  if (exerciseDone) {
    playDone();
    await flow.playExerciseOut();
    store.advanceExercise();
  }
}

function onUndo() {
  store.undoOneSet();
  haptic("light");
}

function goCardio() {
  uni.switchTab({ url: "/pages/cardio/cardio" });
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
  padding: 120rpx 32rpx 200rpx;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40rpx;
}
.hello {
  display: block;
  font-size: 28rpx;
  letter-spacing: 4rpx;
  color: #00d4ff;
}
.today {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #e8f0ff;
  margin-top: 8rpx;
}
.ring-inner {
  display: flex;
  align-items: baseline;
}
.ring-pct {
  font-size: 50rpx;
  font-weight: 900;
  color: #00ffa3;
  text-shadow: 0 0 12rpx #00ffa3;
}
.ring-lbl {
  font-size: 24rpx;
  color: #00d4ff;
  margin-left: 4rpx;
}
.title-block {
  margin: 8rpx 0 20rpx;
}
.sub {
  display: block;
  margin-top: 8rpx;
  color: #5a6473;
  letter-spacing: 8rpx;
  font-size: 24rpx;
}
.action-row {
  display: flex;
  gap: 24rpx;
  margin-top: 32rpx;
  align-items: center;
  justify-content: center;
}
.ghost-btn {
  padding: 22rpx 40rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(0, 212, 255, 0.5);
  color: #00d4ff;
  font-size: 28rpx;
  letter-spacing: 4rpx;
  background: rgba(0, 212, 255, 0.06);
}
.done-btn {
  flex: 1;
  max-width: 480rpx;
}
.next-list {
  margin-top: 56rpx;
}
.next-title {
  display: block;
  font-size: 24rpx;
  letter-spacing: 8rpx;
  color: #5a6473;
  margin-bottom: 20rpx;
}
.next-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid rgba(0, 212, 255, 0.08);
  &.pending .n-name {
    color: #00ffa3;
  }
}
.n-idx {
  width: 80rpx;
  color: #5a6473;
  font-weight: 700;
}
.n-name {
  flex: 1;
  color: #b9c4d6;
  font-size: 30rpx;
}
.n-rep {
  color: #5a6473;
  font-size: 24rpx;
  letter-spacing: 2rpx;
}
.cardio-hint,
.rest {
  margin-top: 40rpx;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}
.ch-title,
.r-title {
  font-size: 44rpx;
  font-weight: 900;
  letter-spacing: 6rpx;
  color: #00ffa3;
  text-shadow: 0 0 14rpx rgba(0, 255, 163, 0.7);
}
.ch-sub,
.r-sub {
  color: #b9c4d6;
  font-size: 26rpx;
}
</style>
