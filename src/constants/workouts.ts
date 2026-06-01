import type {
  WorkoutTemplate,
  CardioType,
  WeekdayKey,
  PlanDay,
  PlanExercise,
  PlanTemplate,
} from "@/types";

export const CARDIO_LABEL: Record<CardioType, string> = {
  STAIR: "爬楼机",
  INCLINE: "爬坡走",
  ELLIPTICAL: "椭圆机",
  BIKE: "动感单车",
  TREADMILL: "跑步机",
};

export const CARDIO_OPTIONS: {
  value: CardioType;
  label: string;
  icon: string;
}[] = [
  { value: "STAIR", label: "爬楼机", icon: "⛰️" },
  { value: "INCLINE", label: "爬坡走", icon: "🥾" },
  { value: "ELLIPTICAL", label: "椭圆机", icon: "🌀" },
  { value: "BIKE", label: "动感单车", icon: "🚴" },
  { value: "TREADMILL", label: "跑步机", icon: "🏃" },
];

export const WORKOUT_A: WorkoutTemplate = {
  type: "A",
  title: "力量 A",
  subtitle: "LOWER + PUSH",
  weekday: 1,
  exercises: [
    { id: "a1", name: "腿举机", totalSets: 3, repRange: "8-12" },
    { id: "a2", name: "哑铃卧推 / 推胸机", totalSets: 3, repRange: "8-10" },
    { id: "a3", name: "坐姿划船", totalSets: 4, repRange: "8-12" },
    { id: "a4", name: "罗马尼亚硬拉", totalSets: 3, repRange: "8-10" },
    {
      id: "a5",
      name: "平板支撑",
      totalSets: 3,
      repRange: "30-45s",
      isTimed: true,
      timeRange: "30-45",
    },
    { id: "a6", name: "面拉", totalSets: 3, repRange: "12-15" },
    { id: "a7", name: "Dead Bug（死虫）", totalSets: 3, repRange: "8/边" },
  ],
};

export const WORKOUT_B: WorkoutTemplate = {
  type: "B",
  title: "力量 B",
  subtitle: "PULL + GLUTE",
  weekday: 3,
  exercises: [
    { id: "b1", name: "高位下拉", totalSets: 4, repRange: "8-10" },
    { id: "b2", name: "肩推", totalSets: 3, repRange: "8-10" },
    { id: "b3", name: "哑铃侧平举", totalSets: 3, repRange: "12-15" },
    { id: "b4", name: "臀桥 / 臀推", totalSets: 3, repRange: "8-12" },
    { id: "b5", name: "腿弯举", totalSets: 3, repRange: "10-12" },
    { id: "b6", name: "Pallof Press", totalSets: 3, repRange: "10/边" },
    { id: "b7", name: "弹力带侧走 / 蚌式", totalSets: 2, repRange: "12/边" },
  ],
};

export const WORKOUT_C: WorkoutTemplate = {
  type: "C",
  title: "力量 C",
  subtitle: "SQUAT + UPPER",
  weekday: 5,
  exercises: [
    {
      id: "c1",
      name: "史密斯深蹲 / 高脚杯深蹲",
      totalSets: 3,
      repRange: "6-10",
    },
    { id: "c2", name: "上斜推胸", totalSets: 3, repRange: "8-10" },
    {
      id: "c3",
      name: "胸托划船 / 单臂哑铃划船",
      totalSets: 4,
      repRange: "8-12",
    },
    { id: "c4", name: "绳索下压", totalSets: 3, repRange: "10-15" },
    { id: "c5", name: "哑铃弯举", totalSets: 3, repRange: "10-15" },
    { id: "c6", name: "反向飞鸟", totalSets: 3, repRange: "12-15" },
    { id: "c7", name: "农夫行走（可选）", totalSets: 2, repRange: "30-40m" },
  ],
};

export const CARDIO_TEMPLATE: WorkoutTemplate = {
  type: "CARDIO",
  title: "有氧日",
  subtitle: "CARDIO BURN",
  weekday: 6,
  exercises: [],
};

export const ALL_TEMPLATES: WorkoutTemplate[] = [
  WORKOUT_A,
  WORKOUT_B,
  WORKOUT_C,
  CARDIO_TEMPLATE,
];

/** 根据星期几获取今日训练模板，非训练日返回 null */
export function getTodayTemplate(date = new Date()): WorkoutTemplate | null {
  const w = date.getDay(); // 0(日) - 6(六)
  switch (w) {
    case 1:
      return WORKOUT_A;
    case 3:
      return WORKOUT_B;
    case 5:
      return WORKOUT_C;
    case 2:
    case 6:
      return CARDIO_TEMPLATE;
    default:
      return null;
  }
}

/** 星期键，按 JS getDay() (0=周日) 索引 */
export const WEEKDAY_KEYS: WeekdayKey[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

/** 用于界面展示的星期顺序（周一开头） */
export const WEEK_ORDER: WeekdayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const WEEKDAY_LABEL: Record<WeekdayKey, string> = {
  monday: "周一",
  tuesday: "周二",
  wednesday: "周三",
  thursday: "周四",
  friday: "周五",
  saturday: "周六",
  sunday: "周日",
};

export function todayWeekdayKey(date = new Date()): WeekdayKey {
  return WEEKDAY_KEYS[date.getDay()];
}

let _uid = 0;
function pid(): string {
  _uid += 1;
  return `pe_${Date.now().toString(36)}_${_uid}`;
}

function emptyDay(): PlanDay {
  return { rest: true, exercises: [] };
}

function dayFrom(tpl: WorkoutTemplate, cat: PlanExercise["category"]): PlanDay {
  return {
    rest: false,
    exercises: tpl.exercises.map((e, i) => ({
      id: pid(),
      exerciseId: e.id,
      name: e.name,
      category: cat,
      sets: e.totalSets,
      reps: e.repRange,
      sort: i,
    })),
  };
}

/** 由内置力量 A/B/C + 有氧构建一份「推荐计划」模板 */
export function buildRecommendedTemplate(): PlanTemplate {
  const now = Date.now();
  return {
    name: "新手推荐计划",
    active: true,
    createdAt: now,
    updatedAt: now,
    days: {
      monday: dayFrom(WORKOUT_A, "legs"),
      tuesday: emptyDay(),
      wednesday: dayFrom(WORKOUT_B, "back"),
      thursday: emptyDay(),
      friday: dayFrom(WORKOUT_C, "legs"),
      saturday: { rest: false, exercises: [] },
      sunday: emptyDay(),
    },
  };
}

/** 新建一份空白模板 */
export function buildEmptyTemplate(name = "我的训练计划"): PlanTemplate {
  const now = Date.now();
  return {
    name,
    active: false,
    createdAt: now,
    updatedAt: now,
    days: {
      monday: emptyDay(),
      tuesday: emptyDay(),
      wednesday: emptyDay(),
      thursday: emptyDay(),
      friday: emptyDay(),
      saturday: emptyDay(),
      sunday: emptyDay(),
    },
  };
}

export function genPlanExerciseId(): string {
  return pid();
}
