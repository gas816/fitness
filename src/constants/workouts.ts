import type { WorkoutTemplate, CardioType } from "@/types";

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
    case 6:
      return CARDIO_TEMPLATE;
    default:
      return null;
  }
}
