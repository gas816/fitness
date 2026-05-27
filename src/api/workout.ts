import { callCloud } from "@/utils/cloud";
import type { WorkoutRecordDoc, WorkoutType, Exercise } from "@/types";

export async function fetchTodayRecord(
  date: string,
): Promise<WorkoutRecordDoc | null> {
  return callCloud<WorkoutRecordDoc | null>("workout", {
    action: "today",
    date,
  });
}

export async function saveRecord(payload: {
  date: string;
  workoutType: WorkoutType;
  exercises: Exercise[];
  completed: boolean;
  duration: number;
}): Promise<WorkoutRecordDoc> {
  return callCloud<WorkoutRecordDoc>("workout", { action: "save", ...payload });
}

export async function fetchMonthRecords(
  yearMonth: string,
): Promise<WorkoutRecordDoc[]> {
  return callCloud<WorkoutRecordDoc[]>("workout", {
    action: "month",
    yearMonth,
  });
}

export async function fetchStats(): Promise<{
  weekCount: number;
  totalDays: number;
  cardioMinutes: number;
}> {
  return callCloud("workout", { action: "stats" });
}
