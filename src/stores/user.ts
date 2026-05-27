import { defineStore } from "pinia";
import { cloudLogin, updateProfile } from "@/api/user";
import type { UserDoc } from "@/types";

const STORAGE_KEY = "fitness:user";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as UserDoc | null,
  }),
  getters: {
    isLogin: (s) => !!s.user?.openid,
    nickname: (s) => s.user?.nickname || "战士",
    avatar: (s) => s.user?.avatar || "",
  },
  actions: {
    async restore() {
      try {
        const cached = uni.getStorageSync(STORAGE_KEY);
        if (cached) this.user = JSON.parse(cached) as UserDoc;
      } catch {}
    },

    persist() {
      if (this.user) uni.setStorageSync(STORAGE_KEY, JSON.stringify(this.user));
      else uni.removeStorageSync(STORAGE_KEY);
    },

    async loginWithWeChat(opts: { nickname?: string; avatar?: string } = {}) {
      const { user } = await cloudLogin(opts);
      this.user = user;
      this.persist();
      return user;
    },

    async updateMyProfile(payload: { nickname?: string; avatar?: string }) {
      const u = await updateProfile(payload);
      this.user = u;
      this.persist();
    },

    logout() {
      this.user = null;
      this.persist();
      uni.reLaunch({ url: "/pages/login/login" });
    },
  },
});
