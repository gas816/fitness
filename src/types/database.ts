/** 数据库实体类型定义（与云数据库 schema 对齐） */

export interface UserDoc {
  _id?: string;
  openid: string;
  nickname: string;
  avatar: string;
  createdAt: number;
  lastLoginAt: number;
}

export type WorkoutType = "A" | "B" | "C" | "CARDIO" | "REST";

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
