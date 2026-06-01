/** 数据库实体类型定义（与云数据库 schema 对齐） */

export interface UserDoc {
  _id?: string;
  openid: string;
  nickname: string;
  avatar: string;
  createdAt: number;
  lastLoginAt: number;
}

export type WorkoutType = "A" | "B" | "C" | "CARDIO" | "REST" | "CUSTOM";

/** 动作分类 */
export type ExerciseCategory =
  | "chest"
  | "back"
  | "legs"
  | "shoulder"
  | "arm"
  | "core"
  | "cardio";

/** 动作库中的一个动作 */
export interface LibExercise {
  id: string;
  name: string;
  category: ExerciseCategory;
}

/** 星期键（与云端 days 字段对齐） */
export type WeekdayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

/** 训练计划中的单个动作配置 */
export interface PlanExercise {
  /** 实例唯一 id（用于拖拽 key） */
  id: string;
  /** 引用动作库 id */
  exerciseId: string;
  name: string;
  category: ExerciseCategory;
  sets: number;
  /** 次数，如 "10" 或 "8-12" */
  reps: string;
  /** 有氧专用：时长（分钟） */
  duration?: number;
  /** 有氧专用：强度，如 "中等" */
  intensity?: string;
  sort: number;
}

/** 一天的训练安排 */
export interface PlanDay {
  rest: boolean;
  exercises: PlanExercise[];
}

/** 用户训练计划模板 */
export interface PlanTemplate {
  _id?: string;
  userId?: string;
  name: string;
  /** 七天计划 */
  days: Record<WeekdayKey, PlanDay>;
  /** 是否为当前启用模板 */
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ExerciseSet {
  /** 是否完成 */
  done: boolean;
  /** 实际完成次数（可选记录） */
  reps?: number;
  /** 重量（可选） */
  weight?: number;
  completedAt?: number;
}

export interface Exercise {
  id: string;
  name: string;
  /** 推荐组数 */
  totalSets: number;
  /** 推荐次数（区间字符串，如 8-12） */
  repRange: string;
  /** 备注 */
  tip?: string;
  /** 是否为时间型动作（如平板支撑） */
  isTimed?: boolean;
  /** 时间型动作的推荐秒数（如 30-45 秒） */
  timeRange?: string;
  sets: ExerciseSet[];
}

export interface WorkoutTemplate {
  type: WorkoutType;
  title: string;
  subtitle: string;
  weekday: number; // 0-6
  exercises: Omit<Exercise, "sets">[];
}

export interface WorkoutRecordDoc {
  _id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  workoutType: WorkoutType;
  /** 自定义计划的可读标题（如「胸 + 三头」），优先于 workoutType 展示 */
  title?: string;
  exercises: Exercise[];
  completed: boolean;
  duration: number; // 秒
  createdAt: number;
  updatedAt: number;
}

export type CardioType =
  | "STAIR"
  | "INCLINE"
  | "ELLIPTICAL"
  | "BIKE"
  | "TREADMILL";

export interface CardioRecordDoc {
  _id?: string;
  userId: string;
  type: CardioType;
  duration: number; // 分钟
  intensity: number; // 1-10
  remark?: string;
  createdAt: number;
  date: string; // YYYY-MM-DD
}

export interface CloudResp<T> {
  code: number;
  msg?: string;
  data: T;
}
