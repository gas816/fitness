import { callCloud } from "@/utils/cloud";
import type { UserDoc } from "@/types";

export interface LoginResp {
  user: UserDoc;
  isNew: boolean;
}

export async function cloudLogin(payload: {
  nickname?: string;
  avatar?: string;
}): Promise<LoginResp> {
  return callCloud<LoginResp>("login", payload);
}

export async function updateProfile(payload: {
  nickname?: string;
  avatar?: string;
}): Promise<UserDoc> {
  return callCloud<UserDoc>("login", { action: "update", ...payload });
}
