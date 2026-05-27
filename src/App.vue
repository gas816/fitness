<script setup lang="ts">
import { onLaunch, onShow } from "@dcloudio/uni-app";
import { initCloud } from "@/utils/cloud";
import { useUserStore } from "@/stores/user";

onLaunch(async () => {
  initCloud();
  const user = useUserStore();
  await user.restore();
  // 未登录则跳转登录页
  if (!user.isLogin) {
    uni.reLaunch({ url: "/pages/login/login" });
  }
});

onShow(() => {
  // 全局深色状态栏
  uni.setNavigationBarColor({
    frontColor: "#ffffff",
    backgroundColor: "#05070d",
  });
});
</script>

<style lang="scss">
@import "@/styles/cyber.scss";

page {
  background: #05070d;
  color: #e8f0ff;
  font-family:
    -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC",
    "Helvetica Neue", Helvetica, sans-serif;
  --neon-green: #00ffa3;
  --neon-blue: #00d4ff;
  --neon-pink: #ff2bd6;
  --bg-0: #05070d;
  --bg-1: #0b1020;
  --bg-2: #121a2e;
  --line: rgba(0, 212, 255, 0.18);
}
</style>
