import { defineStore } from "pinia";
import type {
  Exercise,
  ExerciseSet,
  WorkoutRecordDoc,
  WorkoutTemplate,
} from "@/types";
import { getTodayTemplate } from "@/constants/workouts";
import { fetchTodayRecord, saveRecord } from "@/api/workout";
import { todayStr } from "@/utils/date";

interface State {
  template: WorkoutTemplate | null;
  exercises: Exercise[];
  currentIndex: number;
  startedAt: number;
  loading: boolean;
  saving: boolean;
  finished: boolean;
}

function hydrate(t: WorkoutTemplate): Exercise[] {
  return t.exercises.map((e) => ({
    ...e,
    sets: Array.from(
      { length: e.totalSets },
      () => ({ done: false }) as ExerciseSet,
    ),
  }));
}

export const useWorkoutStore = defineStore("workout", {
  state: (): State => ({
    template: null,
    exercises: [],
    currentIndex: 0,
    startedAt: 0,
    loading: false,
    saving: false,
    finished: false,
  }),

  getters: {
    currentExercise: (s) => s.exercises[s.currentIndex] || null,
    completedSets: (s) =>
      s.exercises.reduce((n, e) => n + e.sets.filter((x) => x.done).length, 0),
    totalSets: (s) => s.exercises.reduce((n, e) => n + e.totalSets, 0),
    progress(): number {
      return this.totalSets === 0 ? 0 : this.completedSets / this.totalSets;
    },
    progressPct(): number {
      return Math.round(this.progress * 100);
    },
    allDone(): boolean {
      return this.totalSets > 0 && this.completedSets === this.totalSets;
    },
    currentSetIndex(): number {
      const ex = this.currentExercise;
      if (!ex) return 0;
      return ex.sets.findIndex((s) => !s.done);
    },
    remainingSets(): number {
      const ex = this.currentExercise;
      if (!ex) return 0;
      return ex.sets.filter((s) => !s.done).length;
    },
  },

  actions: {
    /** 进入页面：根据星期加载今日模板并尝试拉取云端进度 */
    async loadToday() {
      this.loading = true;
      this.finished = false;
      try {
        const tpl = getTodayTemplate();
        this.template = tpl;
        if (!tpl) {
          this.exercises = [];
          return;
        }
        if (tpl.type === "CARDIO") {
          this.exercises = [];
          return;
        }

        const date = todayStr();
        let remote: WorkoutRecordDoc | null = null;
        try {
          remote = await fetchTodayRecord(date);
        } catch {
          /* 网络异常容错 */
        }

        if (remote && remote.workoutType === tpl.type) {
          this.exercises = remote.exercises;
          this.finished = remote.completed;
          this.startedAt = remote.createdAt || Date.now();
        } else {
          this.exercises = hydrate(tpl);
          this.startedAt = Date.now();
        }

        // 定位到第一个未完成的动作
        const idx = this.exercises.findIndex((e) =>
          e.sets.some((s) => !s.done),
        );
        this.currentIndex = idx === -1 ? this.exercises.length - 1 : idx;
      } finally {
        this.loading = false;
      }
    },

    /** 标记当前动作的下一组完成。返回 true 表示该动作完成、需触发出场动画。 */
    completeOneSet(): { exerciseDone: boolean; missionDone: boolean } {
      const ex = this.currentExercise;
      if (!ex) return { exerciseDone: false, missionDone: false };
      const i = ex.sets.findIndex((s) => !s.done);
      if (i === -1) return { exerciseDone: true, missionDone: this.allDone };
      ex.sets[i] = { ...ex.sets[i], done: true, completedAt: Date.now() };
      const exerciseDone = ex.sets.every((s) => s.done);
      const missionDone = this.allDone;
      // 异步保存（不阻塞 UI）
      void this.flush();
      return { exerciseDone, missionDone };
    },

    /** 撤销最后一组 */
    undoOneSet() {
      const ex = this.currentExercise;
      if (!ex) return;
      for (let i = ex.sets.length - 1; i >= 0; i--) {
        if (ex.sets[i].done) {
          ex.sets[i] = { done: false };
          void this.flush();
          return;
        }
      }
    },

    /** 卡片出场后切到下一个动作 */
    advanceExercise() {
      if (this.currentIndex < this.exercises.length - 1) {
        this.currentIndex += 1;
      } else {
        this.finished = true;
      }
    },

    /** 同步进度到云端 */
    async flush() {
      if (!this.template || this.template.type === "CARDIO") return;
      if (this.saving) return;
      this.saving = true;
      try {
        await saveRecord({
          date: todayStr(),
          workoutType: this.template.type,
          exercises: this.exercises,
          completed: this.allDone,
          duration: Math.max(
            0,
            Math.floor((Date.now() - this.startedAt) / 1000),
          ),
        });
      } catch {
        /* 容错：稍后下一组再写 */
      } finally {
        this.saving = false;
      }
    },

    reset() {
      if (!this.template) return;
      this.exercises = hydrate(this.template);
      this.currentIndex = 0;
      this.finished = false;
      this.startedAt = Date.now();
      void this.flush();
    },
  },
});
