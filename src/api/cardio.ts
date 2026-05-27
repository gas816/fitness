import { callCloud } from "@/utils/cloud";
import type { CardioRecordDoc, CardioType } from "@/types";

export async function saveCardio(payload: {
  type: CardioType;
  duration: number;
  intensity: number;
  remark?: string;
  date: string;
}): Promise<CardioRecordDoc> {
  return callCloud<CardioRecordDoc>("cardio", { action: "save", ...payload });
}

export async function fetchCardioByDate(
  date: string,
): Promise<CardioRecordDoc[]> {
  return callCloud<CardioRecordDoc[]>("cardio", { action: "byDate", date });
}

export async function fetchCardioMonth(
  yearMonth: string,
): Promise<CardioRecordDoc[]> {
  return callCloud<CardioRecordDoc[]>("cardio", { action: "month", yearMonth });
}
