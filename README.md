# Fitness HUD · 沉浸式力量训练追踪小程序

> uni-app + Vue3 + TypeScript + Pinia + uv-ui + 微信云开发
> 暗黑科技风 / 赛博朋克 HUD / 游戏化训练推进

## 一、目录结构

```
fitness/
├─ cloudfunctions/                # 微信云函数
│  ├─ login/                      # 登录：获取 openid，自动建用户
│  ├─ workout/                    # 训练记录：今日/保存/月历/统计
│  └─ cardio/                     # 有氧记录：保存/查询
├─ src/
│  ├─ api/                        # 业务接口封装（调用云函数）
│  │   ├─ user.ts
│  │   ├─ workout.ts
│  │   └─ cardio.ts
│  ├─ components/                 # 通用组件
│  │   ├─ CyberBg.vue             # 赛博背景（网格+扫描线+光斑）
│  │   ├─ ExerciseCard.vue        # 训练动作卡片
│  │   ├─ RingProgress.vue        # 环形进度
│  │   └─ MissionComplete.vue     # 完成 HUD 全屏动画
│  ├─ composables/
│  │   └─ useWorkoutFlow.ts       # 训练推进动画状态机
│  ├─ constants/
│  │   └─ workouts.ts             # 内置力量A/B/C + 有氧模板
│  ├─ pages/
│  │   ├─ login/                  # 微信一键登录
│  │   ├─ index/                  # 首页 · 今日任务推进
│  │   ├─ cardio/                 # 有氧
│  │   ├─ calendar/               # 训练日历
│  │   └─ profile/                # 个人中心
│  ├─ stores/                     # Pinia
│  │   ├─ user.ts
│  │   └─ workout.ts              # 训练状态机（核心）
│  ├─ styles/cyber.scss           # 赛博风样式 mixin / 动画
│  ├─ types/                      # TS 类型定义（DB schema）
│  ├─ utils/                      # cloud / haptic / date
│  ├─ App.vue
│  ├─ main.ts
│  ├─ manifest.json
│  ├─ pages.json
│  └─ uni.scss
├─ index.html
├─ package.json
├─ tsconfig.json
└─ vite.config.ts
```

## 二、运行

```bash
pnpm install
pnpm dev:mp-weixin           # 产物在 dist/dev/mp-weixin
```

将 `dist/dev/mp-weixin` 在「微信开发者工具」中导入即可。

## 三、云开发初始化（必须）

1. 在微信开发者工具中打开 → 云开发 → 创建环境
2. 把 **环境 ID** 填入 [src/utils/cloud.ts](src/utils/cloud.ts#L7) 的 `ENV_ID`
3. 在「云开发控制台 → 数据库」新建以下集合（权限设为：仅创建者可读写）：
   - `users`
   - `workout_records`
   - `cardio_records`
4. 在「云函数」目录右键 `login` / `workout` / `cardio`，分别选择「上传并部署：云端安装依赖」

## 四、数据库 Schema

### users

| 字段        | 类型   | 说明              |
| ----------- | ------ | ----------------- |
| \_id        | string | 主键              |
| openid      | string | 微信 openid，唯一 |
| nickname    | string | 昵称              |
| avatar      | string | 头像 url          |
| createdAt   | number | 创建时间戳        |
| lastLoginAt | number | 最近登录时间戳    |

### workout_records

| 字段            | 类型                |
| --------------- | ------------------- |
| userId (openid) | string              |
| date            | string `YYYY-MM-DD` |
| workoutType     | `A` / `B` / `C`     |
| exercises       | Exercise[]          |
| completed       | boolean             |
| duration        | number (秒)         |
| createdAt       | number              |
| updatedAt       | number              |

### cardio_records

| 字段      | 类型                                                      |
| --------- | --------------------------------------------------------- |
| userId    | string                                                    |
| type      | `STAIR` / `INCLINE` / `ELLIPTICAL` / `BIKE` / `TREADMILL` |
| duration  | number (分钟)                                             |
| intensity | number (1-10)                                             |
| remark    | string                                                    |
| date      | string                                                    |
| createdAt | number                                                    |

## 五、训练日历（自动加载）

| 周一   | 周三   | 周五   | 周六 | 其它     |
| ------ | ------ | ------ | ---- | -------- |
| 力量 A | 力量 B | 力量 C | 有氧 | REST DAY |

可在 [src/constants/workouts.ts](src/constants/workouts.ts) 修改训练模板。

## 六、核心体验流：完成一组

1. 点击 `完成一组` → `useWorkoutStore.completeOneSet()` 把当前动作的下一组置为已完成
2. 触发：震动（`haptic.ts`）、数字弹跳（`number-pop` keyframe）、按钮发光
3. 若该动作所有组完成 → `playExerciseOut()`：卡片上滑淡出（`card-out`）→ `advanceExercise()` 切下一项
4. 若今日全部完成 → 全屏 `MissionComplete` HUD（`MISSION COMPLETE · 你正在变强`）
5. 每一步都 `void store.flush()` 异步写入云端，**不阻塞 UI**，不弹窗

## 七、可扩展点

- 接入 `wx.getUserProfile`（注意：基础库 2.27.1+ 已废弃，本项目采用 `getUserInfo` 按钮 + openid 兜底）
- `MissionComplete` 可接入 `lottie-miniprogram` 替换为更复杂动画
- 训练模板可拓展为云端可配置（新建 `workout_templates` 集合并替换 `getTodayTemplate`）
