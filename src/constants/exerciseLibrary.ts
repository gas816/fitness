import type { ExerciseCategory, LibExercise } from "@/types";

/** 分类元信息 */
export const CATEGORIES: {
  key: ExerciseCategory;
  label: string;
  icon: string;
  color: string;
}[] = [
  { key: "chest", label: "胸", icon: "🫁", color: "#00ffa3" },
  { key: "back", label: "背", icon: "🔙", color: "#00d4ff" },
  { key: "legs", label: "腿", icon: "🦵", color: "#ff2bd6" },
  { key: "shoulder", label: "肩", icon: "🏋️", color: "#ffb547" },
  { key: "arm", label: "手臂", icon: "💪", color: "#7c5cff" },
  { key: "core", label: "核心", icon: "🔥", color: "#00ffd0" },
  { key: "cardio", label: "有氧", icon: "🏃", color: "#34e7e4" },
];

/** 动作库 */
export const EXERCISE_LIBRARY: LibExercise[] = [
  // 胸
  { id: "bench-press", name: "杠铃卧推", category: "chest" },
  { id: "db-press", name: "哑铃卧推", category: "chest" },
  { id: "incline-press", name: "上斜卧推", category: "chest" },
  { id: "machine-press", name: "推胸机", category: "chest" },
  { id: "fly", name: "哑铃飞鸟", category: "chest" },
  { id: "cable-fly", name: "绳索夹胸", category: "chest" },
  { id: "dip", name: "双杠臂屈伸", category: "chest" },
  { id: "pushup", name: "俯卧撑", category: "chest" },
  // 背
  { id: "lat-pulldown", name: "高位下拉", category: "back" },
  { id: "pullup", name: "引体向上", category: "back" },
  { id: "seated-row", name: "坐姿划船", category: "back" },
  { id: "db-row", name: "单臂哑铃划船", category: "back" },
  { id: "barbell-row", name: "杠铃划船", category: "back" },
  { id: "rdl", name: "罗马尼亚硬拉", category: "back" },
  { id: "deadlift", name: "硬拉", category: "back" },
  { id: "face-pull", name: "面拉", category: "back" },
  // 腿
  { id: "squat", name: "深蹲", category: "legs" },
  { id: "smith-squat", name: "史密斯深蹲", category: "legs" },
  { id: "goblet-squat", name: "高脚杯深蹲", category: "legs" },
  { id: "leg-press", name: "腿举机", category: "legs" },
  { id: "leg-extension", name: "腿屈伸", category: "legs" },
  { id: "leg-curl", name: "腿弯举", category: "legs" },
  { id: "bulgarian", name: "保加利亚分腿蹲", category: "legs" },
  { id: "hip-thrust", name: "臀推", category: "legs" },
  { id: "calf-raise", name: "提踵", category: "legs" },
  // 肩
  { id: "shoulder-press", name: "肩推", category: "shoulder" },
  { id: "db-shoulder-press", name: "哑铃推肩", category: "shoulder" },
  { id: "lateral-raise", name: "哑铃侧平举", category: "shoulder" },
  { id: "front-raise", name: "前平举", category: "shoulder" },
  { id: "rear-delt-fly", name: "反向飞鸟", category: "shoulder" },
  { id: "upright-row", name: "直立划船", category: "shoulder" },
  // 手臂
  { id: "db-curl", name: "哑铃弯举", category: "arm" },
  { id: "barbell-curl", name: "杠铃弯举", category: "arm" },
  { id: "hammer-curl", name: "锤式弯举", category: "arm" },
  { id: "tricep-pushdown", name: "绳索下压", category: "arm" },
  { id: "overhead-ext", name: "过顶臂屈伸", category: "arm" },
  { id: "preacher-curl", name: "牧师凳弯举", category: "arm" },
  // 核心
  { id: "plank", name: "平板支撑", category: "core" },
  { id: "dead-bug", name: "死虫", category: "core" },
  { id: "pallof-press", name: "Pallof Press", category: "core" },
  { id: "hanging-leg-raise", name: "悬垂举腿", category: "core" },
  { id: "russian-twist", name: "俄罗斯转体", category: "core" },
  { id: "cable-crunch", name: "绳索卷腹", category: "core" },
  // 有氧
  { id: "treadmill", name: "跑步机", category: "cardio" },
  { id: "stair", name: "爬楼机", category: "cardio" },
  { id: "bike", name: "动感单车", category: "cardio" },
  { id: "elliptical", name: "椭圆机", category: "cardio" },
  { id: "incline-walk", name: "爬坡走", category: "cardio" },
];

const LIB_MAP = new Map(EXERCISE_LIBRARY.map((e) => [e.id, e]));
export function getLibExercise(id: string): LibExercise | undefined {
  return LIB_MAP.get(id);
}

/** 智能推荐：选了某动作后，建议接着加的动作 id */
export const SMART_SUGGESTIONS: Record<string, string[]> = {
  "bench-press": ["incline-press", "fly", "cable-fly", "tricep-pushdown"],
  "db-press": ["incline-press", "fly", "cable-fly"],
  squat: ["leg-press", "rdl", "bulgarian", "leg-extension"],
  "smith-squat": ["leg-press", "rdl", "leg-curl"],
  deadlift: ["rdl", "barbell-row", "hip-thrust"],
  "lat-pulldown": ["seated-row", "db-row", "face-pull"],
  pullup: ["lat-pulldown", "barbell-row", "face-pull"],
  "shoulder-press": ["lateral-raise", "rear-delt-fly", "front-raise"],
  "db-curl": ["hammer-curl", "preacher-curl", "barbell-curl"],
  "tricep-pushdown": ["overhead-ext", "dip"],
  "hip-thrust": ["rdl", "leg-curl", "calf-raise"],
};

export function getSuggestions(exerciseId: string): LibExercise[] {
  return (SMART_SUGGESTIONS[exerciseId] || [])
    .map((id) => LIB_MAP.get(id))
    .filter((x): x is LibExercise => !!x);
}
