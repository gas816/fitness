<template>
  <view class="page">
    <CyberBg />
    <view class="content">
      <!-- 顶部栏 -->
      <view class="top">
        <view class="back" @tap="goBack">‹</view>
        <text class="top-title">{{
          isNew ? "创建训练计划" : "编辑训练计划"
        }}</text>
        <view class="save" :class="{ busy: saving }" @tap="onSave">
          {{ saving ? "..." : "保存" }}
        </view>
      </view>

      <view v-if="draft" class="editor">
        <!-- 计划名 -->
        <view class="name-card cyber-card">
          <text class="nc-lbl">计划名称</text>
          <input
            class="nc-ipt"
            v-model="draft.name"
            placeholder="例如：Push Pull Legs"
            placeholder-style="color:#3a4252"
            maxlength="20"
          />
        </view>

        <text class="section">周计划安排 · 长按拖动排序</text>

        <WeekPlanBoard
          :template="draft"
          @add="onAdd"
          @edit="onEdit"
          @remove="onRemove"
          @reorder="onReorder"
          @toggle-rest="onToggleRest"
        />
      </view>
    </view>

    <!-- 动作选择抽屉 -->
    <ExercisePicker
      :visible="pickerVisible"
      :day-label="activeDayLabel"
      :last-added-id="lastAddedId"
      @update:visible="(v) => (pickerVisible = v)"
      @pick="onPickExercise"
    />

    <!-- 组数次数选择 -->
    <RepsSetsPicker
      :visible="repsVisible"
      :sets="editingSets"
      :reps="editingReps"
      :prev-sets="prevSets"
      :prev-reps="prevReps"
      @update:visible="(v) => (repsVisible = v)"
      @confirm="onRepsConfirm"
    />

    <!-- 有氧：时长强度选择 -->
    <CardioPicker
      :visible="cardioVisible"
      :duration="editingDuration"
      :intensity="editingIntensity"
      :prev-duration="prevDuration"
      :prev-intensity="prevIntensity"
      @update:visible="(v) => (cardioVisible = v)"
      @confirm="onCardioConfirm"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import CyberBg from "@/components/CyberBg.vue";
import WeekPlanBoard from "@/components/WeekPlanBoard.vue";
import ExercisePicker from "@/components/ExercisePicker.vue";
import RepsSetsPicker from "@/components/RepsSetsPicker.vue";
import CardioPicker from "@/components/CardioPicker.vue";
import { usePlanStore } from "@/stores/plan";
import { useWorkoutStore } from "@/stores/workout";
import { WEEKDAY_LABEL, genPlanExerciseId } from "@/constants/workouts";
import type { LibExercise, PlanExercise, WeekdayKey } from "@/types";
import { haptic } from "@/utils/haptic";

const plan = usePlanStore();
const workout = useWorkoutStore();

const isNew = ref(true);
const saving = ref(false);

// 草稿（plan store 持有，保证页面间共享）
const draft = computed(() => plan.draft);

onLoad((q) => {
  isNew.value = q?.mode === "new" || !q?.id;
  if (!plan.draft) {
    // 兜底：根据 id 找已有模板，否则空白
    const tpl = q?.id ? plan.templates.find((t) => t._id === q.id) : null;
    plan.startDraft(tpl || undefined);
  }
});

/* ---------- 动作选择 ---------- */
const pickerVisible = ref(false);
const repsVisible = ref(false);
const cardioVisible = ref(false);
const activeDay = ref<WeekdayKey>("monday");
const lastAddedId = ref<string | undefined>();

const activeDayLabel = computed(() => WEEKDAY_LABEL[activeDay.value]);

// 待录入的库动作（先选动作 → 再设参数）
const pendingLib = ref<LibExercise | null>(null);
// 正在编辑的已有动作索引（-1 表示新增）
const editingIndex = ref(-1);
const editingSets = ref<number | undefined>();
const editingReps = ref<string | undefined>();
const editingDuration = ref<number | undefined>();
const editingIntensity = ref<string | undefined>();

// 「沿用上一组」参数：取该天最后一个动作
const prevSets = ref<number | undefined>();
const prevReps = ref<string | undefined>();
const prevDuration = ref<number | undefined>();
const prevIntensity = ref<string | undefined>();

function dayExercises(day: WeekdayKey): PlanExercise[] {
  return plan.draft!.days[day].exercises;
}

function onAdd(day: WeekdayKey) {
  activeDay.value = day;
  const list = dayExercises(day);
  const last = list[list.length - 1];
  prevSets.value = last && last.category !== "cardio" ? last.sets : undefined;
  prevReps.value = last && last.category !== "cardio" ? last.reps : undefined;
  prevDuration.value =
    last && last.category === "cardio" ? last.duration : undefined;
  prevIntensity.value =
    last && last.category === "cardio" ? last.intensity : undefined;
  pickerVisible.value = true;
}

function onPickExercise(ex: LibExercise) {
  pendingLib.value = ex;
  editingIndex.value = -1;
  lastAddedId.value = ex.id;
  pickerVisible.value = false;
  if (ex.category === "cardio") {
    editingDuration.value = prevDuration.value ?? 20;
    editingIntensity.value = prevIntensity.value ?? "中等";
    setTimeout(() => (cardioVisible.value = true), 180);
  } else {
    editingSets.value = prevSets.value ?? 3;
    editingReps.value = prevReps.value ?? "10";
    // 等抽屉收起再弹组次选择，避免动画叠加
    setTimeout(() => (repsVisible.value = true), 180);
  }
}

function onEdit(day: WeekdayKey, index: number) {
  activeDay.value = day;
  editingIndex.value = index;
  pendingLib.value = null;
  const ex = dayExercises(day)[index];
  prevSets.value = undefined;
  prevReps.value = undefined;
  prevDuration.value = undefined;
  prevIntensity.value = undefined;
  if (ex.category === "cardio") {
    editingDuration.value = ex.duration ?? 20;
    editingIntensity.value = ex.intensity ?? "中等";
    cardioVisible.value = true;
  } else {
    editingSets.value = ex.sets;
    editingReps.value = ex.reps;
    repsVisible.value = true;
  }
}

function onRepsConfirm(p: { sets: number; reps: string }) {
  const list = dayExercises(activeDay.value);
  if (editingIndex.value >= 0) {
    // 编辑
    list[editingIndex.value] = {
      ...list[editingIndex.value],
      sets: p.sets,
      reps: p.reps,
    };
  } else if (pendingLib.value) {
    // 新增
    const ex = pendingLib.value;
    list.push({
      id: genPlanExerciseId(),
      exerciseId: ex.id,
      name: ex.name,
      category: ex.category,
      sets: p.sets,
      reps: p.reps,
      sort: list.length,
    });
    plan.draft!.days[activeDay.value].rest = false;
    haptic("medium");
  }
  pendingLib.value = null;
}

function onCardioConfirm(p: { duration: number; intensity: string }) {
  const list = dayExercises(activeDay.value);
  if (editingIndex.value >= 0) {
    list[editingIndex.value] = {
      ...list[editingIndex.value],
      duration: p.duration,
      intensity: p.intensity,
    };
  } else if (pendingLib.value) {
    const ex = pendingLib.value;
    list.push({
      id: genPlanExerciseId(),
      exerciseId: ex.id,
      name: ex.name,
      category: ex.category,
      sets: 1,
      reps: "",
      duration: p.duration,
      intensity: p.intensity,
      sort: list.length,
    });
    plan.draft!.days[activeDay.value].rest = false;
    haptic("medium");
  }
  pendingLib.value = null;
}

function onRemove(day: WeekdayKey, index: number) {
  haptic("light");
  dayExercises(day).splice(index, 1);
}

function onReorder(day: WeekdayKey, list: PlanExercise[]) {
  plan.draft!.days[day].exercises = list;
}

function onToggleRest(day: WeekdayKey) {
  haptic("light");
  plan.draft!.days[day].rest = !plan.draft!.days[day].rest;
}

/* ---------- 保存 ---------- */
async function onSave() {
  if (saving.value || !plan.draft) return;
  if (!plan.draft.name.trim()) {
    uni.showToast({ title: "请填写计划名称", icon: "none" });
    return;
  }
  saving.value = true;
  try {
    const wasFirst = plan.templates.length === 0;
    const saved = await plan.persist(plan.draft);
    if (wasFirst && saved._id) await plan.setActive(saved._id);
    haptic("medium");
    uni.showToast({ title: "已保存", icon: "success" });
    plan.clearDraft();
    // 刷新首页训练
    void workout.loadToday();
    setTimeout(() => goBack(), 500);
  } catch (e) {
    uni.showToast({ title: "保存失败", icon: "none" });
  } finally {
    saving.value = false;
  }
}

function goBack() {
  const pages = getCurrentPages();
  if (pages.length > 1) uni.navigateBack();
  else uni.reLaunch({ url: "/pages/index/index" });
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
  margin-bottom: 28rpx;
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
.save {
  padding: 14rpx 36rpx;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: #05070d;
  background: linear-gradient(120deg, #00ffa3, #00d4ff);
  box-shadow: 0 0 18rpx rgba(0, 255, 163, 0.5);
  &.busy {
    opacity: 0.6;
  }
}
.name-card {
  margin-bottom: 28rpx;
}
.nc-lbl {
  display: block;
  font-size: 24rpx;
  color: #5a6473;
  letter-spacing: 3rpx;
  margin-bottom: 14rpx;
}
.nc-ipt {
  font-size: 40rpx;
  font-weight: 800;
  color: #00ffa3;
}
.section {
  display: block;
  margin: 8rpx 0 20rpx;
  font-size: 24rpx;
  letter-spacing: 4rpx;
  color: #5a6473;
}
</style>
