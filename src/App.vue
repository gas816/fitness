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
  /* 整套赛博背景固化在 page 上：切 tab 时背景完全一致，
     不会因为组件重新挂载/动画重启产生顿挫感 */
  background-color: #04060b;
  background-image:
    radial-gradient(
      ellipse at 20% 0%,
      rgba(0, 212, 255, 0.18),
      transparent 55%
    ),
    radial-gradient(
      ellipse at 80% 100%,
      rgba(0, 255, 163, 0.16),
      transparent 55%
    ),
    linear-gradient(rgba(0, 212, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 255, 0.06) 1px, transparent 1px),
    linear-gradient(180deg, #05070d 0%, #04060b 100%);
  background-size:
    100% 100%,
    100% 100%,
    80rpx 80rpx,
    80rpx 80rpx,
    100% 100%;
  background-repeat: no-repeat, no-repeat, repeat, repeat, no-repeat;
  background-position:
    top left,
    bottom right,
    top left,
    top left,
    top left;
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
