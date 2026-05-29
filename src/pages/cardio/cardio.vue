<template>
  <view class="page">
    <CyberBg />
    <view class="content">
      <text class="neon-title">CARDIO</text>
      <text class="sub">选择你的有氧项目</text>

      <view class="grid">
        <view
          v-for="o in options"
          :key="o.value"
          class="opt"
          :class="{ active: form.type === o.value }"
          @tap="form.type = o.value"
        >
          <text class="ico">{{ o.icon }}</text>
          <text class="lbl">{{ o.label }}</text>
        </view>
      </view>

      <view class="ring-wrap" v-if="running">
        <RingProgress :value="ringValue" :size="380">
          <view class="ring-content">
            <text class="t-num">{{ remaining }}</text>
            <text class="t-lbl">MIN</text>
          </view>
        </RingProgress>
        <text class="breath">呼吸 · 节奏 · 推进</text>
      </view>

      <view class="form-card cyber-card" v-else>
        <view class="row">
          <text class="row-l">时长</text>
          <view class="stepper">
            <view
              class="s-btn"
              @tap="form.duration = Math.max(5, form.duration - 5)"
              >-</view
            >
            <text class="s-num">{{ form.duration }}</text>
            <view
              class="s-btn"
              @tap="form.duration = Math.min(120, form.duration + 5)"
              >+</view
            >
            <text class="unit">MIN</text>
          </view>
        </view>
        <view class="row col">
          <view class="row-head">
            <text class="row-l">强度</text>
            <text class="intensity-val">{{ form.intensity }} / 10</text>
          </view>
          <slider
            class="intensity-slider"
            :value="form.intensity"
            :min="1"
            :max="10"
            :step="1"
            block-size="28"
            block-color="#00ffa3"
            activeColor="#00ffa3"
            backgroundColor="rgba(255,255,255,0.08)"
            @changing="onIntensityChanging"
            @change="onIntensityChange"
          />
          <view class="intensity-scale">
            <text>EASY</text>
            <text>MAX</text>
          </view>
        </view>
        <view class="row">
          <text class="row-l">备注</text>
          <input
            class="ipt"
            v-model="form.remark"
            placeholder="可选"
            placeholder-style="color:#3a4252"
          />
        </view>
      </view>

      <view class="action">
        <view v-if="!running" class="neon-btn" @tap="start">START</view>
        <view v-else class="neon-btn stop" @tap="stop">FINISH</view>
      </view>
    </view>
    <CustomTabBar :current="1" />
  </view>
</template>

<script setup lang="ts">
import { computed, onUnmounted, reactive, ref } from "vue";
import CyberBg from "@/components/CyberBg.vue";
import RingProgress from "@/components/RingProgress.vue";
import CustomTabBar from "@/components/CustomTabBar.vue";
import { CARDIO_OPTIONS } from "@/constants/workouts";
import { saveCardio } from "@/api/cardio";
import { todayStr } from "@/utils/date";
import { haptic, playMission } from "@/utils/haptic";

const options = CARDIO_OPTIONS;

const form = reactive({
  type: "STAIR" as (typeof CARDIO_OPTIONS)[number]["value"],
  duration: 20,
  intensity: 6,
  remark: "",
});

const running = ref(false);
const startedAt = ref(0);
const elapsedSec = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

const ringValue = computed(() =>
  Math.min(1, elapsedSec.value / (form.duration * 60)),
);
const remaining = computed(() =>
  Math.max(0, Math.ceil(form.duration - elapsedSec.value / 60)),
);

function start() {
  haptic("medium");
  running.value = true;
  startedAt.value = Date.now();
  elapsedSec.value = 0;
  timer = setInterval(() => {
    elapsedSec.value = Math.floor((Date.now() - startedAt.value) / 1000);
    if (elapsedSec.value >= form.duration * 60) {
      void stop();
    }
  }, 1000);
}

function onIntensityChanging(e: any) {
  const v = Number(e?.detail?.value);
  if (!Number.isNaN(v) && v !== form.intensity) {
    form.intensity = v;
    haptic("light");
  }
}
function onIntensityChange(e: any) {
  const v = Number(e?.detail?.value);
  if (!Number.isNaN(v)) {
    form.intensity = v;
    haptic("medium");
  }
}

async function stop() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  running.value = false;
  playMission();
  try {
    await saveCardio({
      type: form.type,
      duration: form.duration,
      intensity: form.intensity,
      remark: form.remark,
      date: todayStr(),
    });
    uni.showToast({ title: "已记录", icon: "success" });
  } catch (e) {
    /* ignore */
  }
}

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
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
.sub {
  display: block;
  color: #5a6473;
  letter-spacing: 6rpx;
  margin-top: 12rpx;
}
.grid {
  margin-top: 32rpx;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}
.opt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32rpx 0;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.04);
  border: 1rpx solid rgba(0, 212, 255, 0.15);
  transition: all 0.2s;
  &.active {
    background: linear-gradient(
      135deg,
      rgba(0, 255, 163, 0.18),
      rgba(0, 212, 255, 0.12)
    );
    border-color: rgba(0, 255, 163, 0.7);
    box-shadow: 0 0 24rpx rgba(0, 255, 163, 0.45);
  }
  .ico {
    font-size: 56rpx;
  }
  .lbl {
    color: #b9c4d6;
    margin-top: 12rpx;
    letter-spacing: 4rpx;
    font-size: 26rpx;
  }
}
.ring-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 140rpx 0 80rpx;
  padding-top: 40rpx;
  animation: pulse-glow 3.6s ease-in-out infinite;
}
.ring-content {
  display: flex;
  align-items: baseline;
}
.t-num {
  font-size: 110rpx;
  font-weight: 900;
  color: #00ffa3;
  text-shadow: 0 0 18rpx rgba(0, 255, 163, 0.8);
}
.t-lbl {
  font-size: 28rpx;
  color: #00d4ff;
  margin-left: 8rpx;
  letter-spacing: 4rpx;
}
.breath {
  margin-top: 32rpx;
  color: #5a6473;
  letter-spacing: 8rpx;
  font-size: 24rpx;
}

.form-card {
  margin-top: 40rpx;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
}
.row-l {
  color: #5a6473;
  letter-spacing: 4rpx;
  font-size: 26rpx;
}
.stepper {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.s-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  border: 1rpx solid rgba(0, 212, 255, 0.5);
  color: #00d4ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  font-weight: 700;
}
.s-num {
  min-width: 80rpx;
  text-align: center;
  font-size: 44rpx;
  font-weight: 800;
  color: #00ffa3;
}
.unit {
  color: #5a6473;
  margin-left: 6rpx;
  letter-spacing: 3rpx;
}
.row.col {
  flex-direction: column;
  align-items: stretch;
  gap: 8rpx;
}
.row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.intensity-val {
  color: #00ffa3;
  font-weight: 800;
  font-size: 30rpx;
  letter-spacing: 2rpx;
  text-shadow: 0 0 10rpx rgba(0, 255, 163, 0.6);
}
.intensity-slider {
  margin: 8rpx 4rpx 0;
}
.intensity-scale {
  display: flex;
  justify-content: space-between;
  color: #5a6473;
  font-size: 20rpx;
  letter-spacing: 4rpx;
  margin-top: 4rpx;
  padding: 0 6rpx;
}
.ipt {
  flex: 1;
  margin-left: 32rpx;
  padding: 16rpx 24rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  color: #e8f0ff;
  font-size: 28rpx;
}
.action {
  margin-top: 60rpx;
  display: flex;
  justify-content: center;
}
.stop {
  background: linear-gradient(120deg, #ff2bd6, #00d4ff) !important;
  box-shadow:
    0 0 24rpx rgba(255, 43, 214, 0.5),
    0 0 64rpx rgba(0, 212, 255, 0.3) !important;
}
</style>
