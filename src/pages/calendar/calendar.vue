<template>
  <view class="page">
    <CyberBg />
    <view class="content">
      <view class="head">
        <view class="nav" @tap="shift(-1)">‹</view>
        <text class="ym">{{ year }}.{{ String(month).padStart(2, "0") }}</text>
        <view class="nav" @tap="shift(1)">›</view>
      </view>

      <view class="streak cyber-card">
        <view class="s-item">
          <text class="s-num">{{ streak }}</text>
          <text class="s-lbl">连续训练 DAYS</text>
        </view>
        <view class="s-divider" />
        <view class="s-item">
          <text class="s-num">{{ strengthDays }}</text>
          <text class="s-lbl">本月力量</text>
        </view>
        <view class="s-divider" />
        <view class="s-item">
          <text class="s-num">{{ cardioDays }}</text>
          <text class="s-lbl">本月有氧</text>
        </view>
      </view>

      <view class="legend">
        <view class="lg"><view class="sw plan-s" /><text>计划力量</text></view>
        <view class="lg"><view class="sw plan-c" /><text>计划有氧</text></view>
        <view class="lg"
          ><view class="sw done-s" /><text>已完成力量</text></view
        >
        <view class="lg"
          ><view class="sw done-c" /><text>已完成有氧</text></view
        >
        <view class="lg"><view class="sw rest" /><text>休息</text></view>
      </view>

      <view class="week">
        <text v-for="w in WEEK" :key="w">{{ w }}</text>
      </view>
      <view class="cal">
        <view class="row" v-for="(row, ri) in matrix" :key="ri">
          <view
            v-for="(d, ci) in row"
            :key="ci"
            class="cell"
            :class="cellClass(d)"
            @tap="d && open(d)"
          >
            <text
              class="plan-tag"
              v-if="d && plans[d] && plans[d] !== 'REST'"
              >{{ plans[d] === "C" ? "C" : "S" }}</text
            >
            <text class="d-num">{{ d ? Number(d.slice(-2)) : "" }}</text>
            <view class="dot-row" v-if="d && marks[d]">
              <view class="dot s" v-if="marks[d].hasS" />
              <view class="dot c" v-if="marks[d].hasC" />
            </view>
            <text class="rest-mark" v-else-if="d && plans[d] === 'REST'"
              >·</text
            >
          </view>
        </view>
      </view>

      <view class="detail" v-if="active">
        <text class="dt-title">{{ active }}</text>
        <view v-if="activeWorkout" class="cyber-card mt">
          <text class="x-title"
            >力量 {{ activeWorkout.workoutType }} ·
            {{ activeWorkout.completed ? "COMPLETED" : "IN PROGRESS" }}</text
          >
          <text class="x-meta"
            >{{ Math.round(activeWorkout.duration / 60) }} 分钟 ·
            {{ activeSets }} 组</text
          >
        </view>
        <view v-for="c in activeCardio" :key="c._id" class="cyber-card mt">
          <text class="x-title">有氧 · {{ cardioLbl(c.type) }}</text>
          <text class="x-meta"
            >{{ c.duration }} 分钟 · 强度 {{ c.intensity }}</text
          >
        </view>
        <view v-if="!activeWorkout && !activeCardio.length" class="empty-tip"
          >这一天没有训练记录</view
        >
      </view>
    </view>
    <CustomTabBar :current="2" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import CyberBg from "@/components/CyberBg.vue";
import { buildMonthMatrix, todayStr } from "@/utils/date";
import { fetchMonthRecords } from "@/api/workout";
import { fetchCardioMonth } from "@/api/cardio";
import CustomTabBar from "@/components/CustomTabBar.vue";
import { CARDIO_LABEL } from "@/constants/workouts";
import type { CardioRecordDoc, WorkoutRecordDoc, CardioType } from "@/types";

const WEEK = ["日", "一", "二", "三", "四", "五", "六"];

// 计划类型：周 1/3/5 力量，周 6 有氧，其他休息日
function planOf(dateStr: string): "S" | "C" | "REST" {
  // dateStr: YYYY-MM-DD
  const [y, m, d] = dateStr.split("-").map(Number);
  const w = new Date(y, m - 1, d).getDay();
  if (w === 1 || w === 3 || w === 5) return "S";
  if (w === 6) return "C";
  return "REST";
}

const now = new Date();
const year = ref(now.getFullYear());
const month = ref(now.getMonth() + 1);
const today = todayStr();

const workouts = ref<WorkoutRecordDoc[]>([]);
const cardios = ref<CardioRecordDoc[]>([]);
const active = ref<string | null>(null);

const matrix = computed(() => buildMonthMatrix(year.value, month.value));

const marks = computed(() => {
  const m: Record<
    string,
    { kind: "S" | "C" | "B"; hasS: boolean; hasC: boolean }
  > = {};
  workouts.value.forEach((w) => {
    const k = m[w.date] || { kind: "S", hasS: false, hasC: false };
    k.hasS = true;
    k.kind = k.hasC ? "B" : "S";
    m[w.date] = k;
  });
  cardios.value.forEach((c) => {
    const k = m[c.date] || { kind: "C", hasS: false, hasC: false };
    k.hasC = true;
    k.kind = k.hasS ? "B" : "C";
    m[c.date] = k;
  });
  return m;
});

const plans = computed(() => {
  const map: Record<string, "S" | "C" | "REST"> = {};
  matrix.value.forEach((row) =>
    row.forEach((d) => {
      if (d) map[d] = planOf(d);
    }),
  );
  return map;
});

function cellClass(d: string | null) {
  if (!d) return { empty: true };
  const mk = marks.value[d];
  const pl = plans.value[d];
  return {
    today: d === today,
    strength: mk?.kind === "S",
    cardio: mk?.kind === "C",
    both: mk?.kind === "B",
    "plan-strength": !mk && pl === "S",
    "plan-cardio": !mk && pl === "C",
    "plan-rest": !mk && pl === "REST",
  };
}

const streak = computed(() => {
  // 连续训练天数（从今天往前找）
  const set = new Set([
    ...workouts.value.map((w) => w.date),
    ...cardios.value.map((c) => c.date),
  ]);
  let n = 0;
  const d = new Date();
  while (true) {
    const y = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    if (set.has(`${y}-${mm}-${dd}`)) {
      n += 1;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return n;
});

const strengthDays = computed(
  () => new Set(workouts.value.map((w) => w.date)).size,
);
const cardioDays = computed(
  () => new Set(cardios.value.map((c) => c.date)).size,
);

const activeWorkout = computed(
  () => workouts.value.find((w) => w.date === active.value) || null,
);
const activeCardio = computed(() =>
  cardios.value.filter((c) => c.date === active.value),
);
const activeSets = computed(() => {
  if (!activeWorkout.value) return 0;
  return activeWorkout.value.exercises.reduce(
    (n, e) => n + e.sets.filter((s) => s.done).length,
    0,
  );
});

function cardioLbl(t: CardioType) {
  return CARDIO_LABEL[t];
}

function shift(n: number) {
  let m = month.value + n;
  let y = year.value;
  if (m < 1) {
    m = 12;
    y -= 1;
  }
  if (m > 12) {
    m = 1;
    y += 1;
  }
  month.value = m;
  year.value = y;
  void load();
}

function open(d: string) {
  active.value = d;
}

async function load() {
  const ym = `${year.value}-${String(month.value).padStart(2, "0")}`;
  try {
    const [w, c] = await Promise.all([
      fetchMonthRecords(ym),
      fetchCardioMonth(ym),
    ]);
    workouts.value = w || [];
    cardios.value = c || [];
  } catch {}
}

onMounted(load);
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
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
}
.nav {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid rgba(0, 212, 255, 0.4);
  color: #00d4ff;
  font-size: 40rpx;
}
.ym {
  font-size: 56rpx;
  font-weight: 800;
  color: #00ffa3;
  text-shadow: 0 0 14rpx rgba(0, 255, 163, 0.6);
  letter-spacing: 6rpx;
}
.streak {
  margin: 40rpx 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.s-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.s-num {
  font-size: 56rpx;
  font-weight: 900;
  color: #00ffa3;
  text-shadow: 0 0 12rpx rgba(0, 255, 163, 0.7);
}
.s-lbl {
  color: #5a6473;
  font-size: 22rpx;
  margin-top: 4rpx;
  letter-spacing: 4rpx;
}
.s-divider {
  width: 2rpx;
  height: 60rpx;
  background: rgba(0, 212, 255, 0.25);
}

.week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  color: #5a6473;
  font-size: 24rpx;
  padding: 0 8rpx;
  margin-top: 12rpx;
  text {
    padding: 12rpx 0;
    letter-spacing: 4rpx;
  }
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx 24rpx;
  margin: 24rpx 0 4rpx;
  padding: 0 8rpx;
}
.lg {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #b9c4d6;
  font-size: 22rpx;
  letter-spacing: 2rpx;
}
.sw {
  width: 26rpx;
  height: 26rpx;
  border-radius: 6rpx;
  &.plan-s {
    border: 1rpx dashed rgba(0, 255, 163, 0.7);
  }
  &.plan-c {
    border: 1rpx dashed rgba(0, 212, 255, 0.7);
  }
  &.done-s {
    background: linear-gradient(
      180deg,
      rgba(0, 255, 163, 0.6),
      rgba(0, 255, 163, 0.15)
    );
    box-shadow: inset 0 0 0 1rpx rgba(0, 255, 163, 0.7);
  }
  &.done-c {
    background: linear-gradient(
      180deg,
      rgba(0, 212, 255, 0.6),
      rgba(0, 212, 255, 0.15)
    );
    box-shadow: inset 0 0 0 1rpx rgba(0, 212, 255, 0.7);
  }
  &.rest {
    background: rgba(255, 255, 255, 0.02);
    border: 1rpx solid rgba(255, 255, 255, 0.08);
  }
}
.cal {
  padding: 0 8rpx;
}
.row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8rpx;
}
.cell {
  position: relative;
  min-height: 110rpx;
  padding: 12rpx 0 8rpx;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: rgba(255, 255, 255, 0.025);
  &.empty {
    background: transparent;
  }
  &.today {
    box-shadow: inset 0 0 0 2rpx rgba(0, 212, 255, 0.7);
  }
  // 计划状态（未完成）
  &.plan-strength {
    background: rgba(255, 255, 255, 0.025);
    border: 1rpx dashed rgba(0, 255, 163, 0.45);
  }
  &.plan-cardio {
    background: rgba(255, 255, 255, 0.025);
    border: 1rpx dashed rgba(0, 212, 255, 0.45);
  }
  &.plan-rest {
    background: rgba(255, 255, 255, 0.015);
    border: 1rpx solid rgba(255, 255, 255, 0.05);
    .d-num {
      color: #5a6473;
    }
  }
  // 实际完成（填色覆盖计划描边）
  &.strength {
    border: none;
    background: linear-gradient(
      180deg,
      rgba(0, 255, 163, 0.28),
      rgba(0, 255, 163, 0.06)
    );
    box-shadow: inset 0 0 0 1rpx rgba(0, 255, 163, 0.55);
  }
  &.cardio {
    border: none;
    background: linear-gradient(
      180deg,
      rgba(0, 212, 255, 0.28),
      rgba(0, 212, 255, 0.06)
    );
    box-shadow: inset 0 0 0 1rpx rgba(0, 212, 255, 0.55);
  }
  &.both {
    border: none;
    background: linear-gradient(
      180deg,
      rgba(255, 43, 214, 0.3),
      rgba(0, 255, 163, 0.08)
    );
    box-shadow: inset 0 0 0 1rpx rgba(255, 43, 214, 0.55);
  }
}
.plan-tag {
  position: absolute;
  top: 4rpx;
  right: 6rpx;
  font-size: 18rpx;
  font-weight: 800;
  letter-spacing: 1rpx;
  padding: 0 6rpx;
  border-radius: 6rpx;
  line-height: 22rpx;
  color: #05070d;
}
.plan-strength .plan-tag {
  background: rgba(0, 255, 163, 0.65);
}
.plan-cardio .plan-tag {
  background: rgba(0, 212, 255, 0.65);
}
.strength .plan-tag,
.both .plan-tag {
  background: rgba(0, 255, 163, 0.85);
}
.cardio .plan-tag {
  background: rgba(0, 212, 255, 0.85);
}
.rest-mark {
  margin-top: 6rpx;
  color: #3a4252;
  font-size: 26rpx;
  line-height: 1;
}
.d-num {
  color: #e8f0ff;
  font-weight: 700;
  font-size: 28rpx;
}
.dot-row {
  display: flex;
  gap: 6rpx;
  margin-top: 6rpx;
}
.dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
}
.dot.s {
  background: #00ffa3;
  box-shadow: 0 0 8rpx #00ffa3;
}
.dot.c {
  background: #00d4ff;
  box-shadow: 0 0 8rpx #00d4ff;
}

.detail {
  margin-top: 48rpx;
}
.dt-title {
  display: block;
  color: #00d4ff;
  letter-spacing: 6rpx;
  font-size: 28rpx;
}
.mt {
  margin-top: 20rpx;
}
.x-title {
  display: block;
  font-size: 32rpx;
  color: #00ffa3;
  font-weight: 700;
}
.x-meta {
  display: block;
  color: #b9c4d6;
  margin-top: 8rpx;
  font-size: 26rpx;
}
.empty-tip {
  color: #5a6473;
  margin-top: 24rpx;
  font-size: 26rpx;
  text-align: center;
}
</style>
