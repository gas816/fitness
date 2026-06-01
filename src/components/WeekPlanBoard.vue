<template>
  <view class="board">
    <DayWorkoutCard
      v-for="key in order"
      :key="key"
      :label="labelOf(key)"
      :day="template.days[key]"
      :expanded="expanded === key"
      @toggle="toggle(key)"
      @toggle-rest="$emit('toggle-rest', key)"
      @add="$emit('add', key)"
      @edit="(i) => $emit('edit', key, i)"
      @remove="(i) => $emit('remove', key, i)"
      @reorder="(list) => $emit('reorder', key, list)"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import DayWorkoutCard from "./DayWorkoutCard.vue";
import { WEEK_ORDER, WEEKDAY_LABEL } from "@/constants/workouts";
import type { PlanExercise, PlanTemplate, WeekdayKey } from "@/types";
import { haptic } from "@/utils/haptic";

defineProps<{ template: PlanTemplate }>();

defineEmits<{
  (e: "toggle-rest", day: WeekdayKey): void;
  (e: "add", day: WeekdayKey): void;
  (e: "edit", day: WeekdayKey, index: number): void;
  (e: "remove", day: WeekdayKey, index: number): void;
  (e: "reorder", day: WeekdayKey, list: PlanExercise[]): void;
}>();

const order = WEEK_ORDER;
const expanded = ref<WeekdayKey | null>(WEEK_ORDER[0]);

function labelOf(k: WeekdayKey) {
  return WEEKDAY_LABEL[k];
}

function toggle(k: WeekdayKey) {
  haptic("light");
  expanded.value = expanded.value === k ? null : k;
}
</script>

<style lang="scss" scoped>
.board {
  padding: 8rpx 0;
}
</style>
