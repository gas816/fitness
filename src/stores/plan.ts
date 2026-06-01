import { defineStore } from "pinia";
import type { PlanTemplate, PlanExercise, WeekdayKey } from "@/types";
import {
  fetchTemplates,
  saveTemplate,
  deleteTemplate,
  activateTemplate,
} from "@/api/template";
import {
  buildRecommendedTemplate,
  buildEmptyTemplate,
  todayWeekdayKey,
} from "@/constants/workouts";

const ACTIVE_KEY = "fitness:activeTemplate";

interface State {
  templates: PlanTemplate[];
  loaded: boolean;
  /** 正在编辑的草稿（plan-editor 使用） */
  draft: PlanTemplate | null;
}

export const usePlanStore = defineStore("plan", {
  state: (): State => ({
    templates: [],
    loaded: false,
    draft: null,
  }),

  getters: {
    activeTemplate(s): PlanTemplate | null {
      return s.templates.find((t) => t.active) || s.templates[0] || null;
    },
    hasTemplate(s): boolean {
      return s.templates.length > 0;
    },
  },

  actions: {
    /** 拉取云端模板列表，附带本地缓存兜底 */
    async loadTemplates(force = false) {
      if (this.loaded && !force) return;
      try {
        const list = await fetchTemplates();
        this.templates = list || [];
        this.loaded = true;
        this.cacheActive();
      } catch {
        // 离线：尝试读本地缓存的 active
        const cached = this.readCachedActive();
        if (cached) this.templates = [cached];
      }
    },

    readCachedActive(): PlanTemplate | null {
      try {
        const raw = uni.getStorageSync(ACTIVE_KEY);
        return raw ? (JSON.parse(raw) as PlanTemplate) : null;
      } catch {
        return null;
      }
    },

    cacheActive() {
      const a = this.activeTemplate;
      if (a) uni.setStorageSync(ACTIVE_KEY, JSON.stringify(a));
    },

    /** 今日（按星期）应训练的动作配置 */
    todayPlan(): {
      day: WeekdayKey;
      exercises: PlanExercise[];
      rest: boolean;
      templateName: string;
    } {
      const day = todayWeekdayKey();
      const tpl = this.activeTemplate;
      if (!tpl) return { day, exercises: [], rest: true, templateName: "" };
      const d = tpl.days[day];
      return {
        day,
        exercises: [...(d?.exercises || [])].sort((a, b) => a.sort - b.sort),
        rest: d?.rest ?? true,
        templateName: tpl.name,
      };
    },

    /** 一键导入推荐计划并设为启用 */
    async importRecommended(): Promise<PlanTemplate> {
      const tpl = buildRecommendedTemplate();
      const saved = await saveTemplate(tpl);
      this.upsertLocal(saved);
      await this.setActive(saved._id!);
      return saved;
    },

    /** 新建空白模板（不立即激活），返回保存后的模板 */
    async createBlank(name?: string): Promise<PlanTemplate> {
      const tpl = buildEmptyTemplate(name);
      tpl.active = this.templates.length === 0; // 首个自动激活
      const saved = await saveTemplate(tpl);
      this.upsertLocal(saved);
      if (saved.active) this.cacheActive();
      return saved;
    },

    /** 保存（新建或更新）模板 */
    async persist(tpl: PlanTemplate): Promise<PlanTemplate> {
      tpl.updatedAt = Date.now();
      const saved = await saveTemplate(tpl);
      this.upsertLocal(saved);
      this.cacheActive();
      return saved;
    },

    async remove(id: string) {
      await deleteTemplate(id);
      this.templates = this.templates.filter((t) => t._id !== id);
      // 若删除的是激活模板，自动激活第一个
      if (this.templates.length && !this.templates.some((t) => t.active)) {
        await this.setActive(this.templates[0]._id!);
      }
      this.cacheActive();
    },

    async setActive(id: string) {
      this.templates = this.templates.map((t) => ({
        ...t,
        active: t._id === id,
      }));
      this.cacheActive();
      try {
        await activateTemplate(id);
      } catch {
        /* 容错：本地已切换 */
      }
    },

    upsertLocal(tpl: PlanTemplate) {
      const i = this.templates.findIndex((t) => t._id === tpl._id);
      if (i >= 0) this.templates.splice(i, 1, tpl);
      else this.templates.push(tpl);
    },

    /** ---- 草稿编辑（plan-editor）---- */
    startDraft(tpl?: PlanTemplate) {
      this.draft = tpl ? JSON.parse(JSON.stringify(tpl)) : buildEmptyTemplate();
    },

    clearDraft() {
      this.draft = null;
    },
  },
});
