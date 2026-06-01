import { callCloud } from "@/utils/cloud";
import type { PlanTemplate } from "@/types";

export async function fetchTemplates(): Promise<PlanTemplate[]> {
  return callCloud<PlanTemplate[]>("template", { action: "list" });
}

export async function saveTemplate(tpl: PlanTemplate): Promise<PlanTemplate> {
  return callCloud<PlanTemplate>("template", { action: "save", template: tpl });
}

export async function deleteTemplate(id: string): Promise<{ ok: boolean }> {
  return callCloud("template", { action: "delete", id });
}

export async function activateTemplate(id: string): Promise<{ ok: boolean }> {
  return callCloud("template", { action: "setActive", id });
}
